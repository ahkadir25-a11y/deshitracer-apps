// src/modules/members/member.controller.ts
import { Request, Response, RequestHandler } from 'express';
import * as memberService from './member.service';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { MemberAuthRequest } from '../../middlewares/memberAuth';
import { config } from '../../middlewares/config';
import handleAsyncRequest from '../../utils/handleAsyncRequest';

function signMember(memberId: string) {
  const secret: Secret = config.memberJwtSecret as unknown as Secret;
  const options: SignOptions = {
    expiresIn: config.memberJwtExpiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign({ id: memberId, type: 'member' }, secret, options);
}

// ---------- Public (unchanged signatures are OK) ----------
export const registerController: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const m = await memberService.registerMember(req.body);
    const token = signMember(m._id.toString());
    res.status(201).json({
      token,
      member: {
        id: m._id, name: m.name, phone: m.phone, city: m.city,
        serialNumber: m?.serialNumber, qrCodeUrl: m.qrCodeUrl, active: m.active,
      }
    });
  } catch (e: any) {
    res.status(400).json({ message: e.message || 'Registration failed' });
  }
};

export const loginController: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const m = await memberService.authenticateMember(req.body.phone, req.body.password);
    const token = signMember(m._id.toString());
    res.json({
      token,
      member: {
        id: m._id, name: m.name, phone: m.phone, city: m.city,
        serialNumber: m?.serialNumber, qrCodeUrl: m.qrCodeUrl, active: m.active,
      }
    });
  } catch (e: any) {
    res.status(400).json({ message: e.message || 'Invalid credentials' });
  }
};

// ---------- Authenticated (must be RequestHandler + no return res...) ----------
export const meController: RequestHandler = async (req, res): Promise<void> => {
  const m = await memberService.getMemberById((req as MemberAuthRequest).member!.id);
  if (!m) { res.status(404).json({ message: 'Not found' }); return; }
  res.json({
    id: m._id, name: m.name, phone: m.phone, city: m.city,
    profileImageUrl: m.profileImageUrl,
    serialNumber: m?.serialNumber, qrCodeUrl: m.qrCodeUrl,
    info: `Deshi Tracker active member with serial number ${m?.serialNumber}`,
    active: m.active
  });
};

export const updateMeController: RequestHandler = async (req, res): Promise<void> => {
  const m = await memberService.updateMember((req as MemberAuthRequest).member!.id, {
    name: req.body.name, phone: req.body.phone, city: req.body.city
  });
  res.json({ id: m?._id, name: m?.name, phone: m?.phone, city: m?.city });
};

export const uploadProfileImageController: RequestHandler = async (req, res): Promise<void> => {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) { res.status(400).json({ message: 'No file provided' }); return; }
    const imageUrl = await memberService.uploadProfileImage((req as MemberAuthRequest).member!.id, file.path);
    res.json({ profileImageUrl: imageUrl });
  } catch (e: any) {
    res.status(500).json({ message: e.message || 'Upload failed' });
  }
};

export const setStatusController: RequestHandler = async (req, res): Promise<void> => {
  const updated = await memberService.setActiveStatus((req as MemberAuthRequest).member!.id, req.body.active);
  res.json({ active: updated?.active });
};

export const deleteMeController: RequestHandler = async (req, res): Promise<void> => {
  await memberService.deleteMember((req as MemberAuthRequest).member!.id);
  res.json({ message: 'Account deleted and all data removed.' });
};

// ---------- Wrapped controllers must be Promise<void> and never return Response ----------
export const verifyBySlugController = handleAsyncRequest(async (req: Request, res: Response): Promise<void> => {
  const data = await memberService.verifyBySlug(req.params.slug);
  res.json(data);
});

export const lookupBySerialController = handleAsyncRequest(async (req: Request, res: Response): Promise<void> => {
  const data = await memberService.lookupBySerial(req.params.serial);
  if (!data) { res.status(404).json({ message: 'Member not found' }); return; }
  res.json(data);
});

export const searchBySerialController = handleAsyncRequest(async (req: Request, res: Response): Promise<void> => {
  const serial = String(req.query.serial || '').trim();
  if (!serial) { res.status(400).json({ message: 'Query parameter "serial" is required' }); return; }
  const data = await memberService.searchMemberBySerial(serial);
  if (!data) { res.status(404).json({ message: 'Member not found' }); return; }
  res.json(data);
});

export const pagedSearchMembersController = handleAsyncRequest(async (req: Request, res: Response): Promise<void> => {
  const q = typeof req.query.q === 'string' ? req.query.q : undefined;
  const page = Number.parseInt(String(req.query.page ?? '1'), 10) || 1;
  const limit = Number.parseInt(String(req.query.limit ?? '10'), 10) || 10;
  const data = await memberService.pagedMemberSearch({ q, page, limit });
  res.json(data);
});

export const setStatusBySerialController = handleAsyncRequest(async (req: Request, res: Response): Promise<void> => {
  const { serial, active } = req.body as { serial?: string; active?: boolean };
  if (!serial || typeof active !== 'boolean') {
    res.status(400).json({ message: 'Fields "serial" (string) and "active" (boolean) are required' });
    return;
  }
  try {
    const data = await memberService.setActiveStatusBySerial(serial, active);
    res.json(data);
  } catch (e: any) {
    if (e?.message === 'Member not found') { res.status(404).json({ message: 'Member not found' }); return; }
    res.status(500).json({ message: e?.message || 'Update failed' });
  }
});

// Restaurant offers (also Promise<void>)
export const getRestaurantOffersController = handleAsyncRequest(async (req: Request, res: Response): Promise<void> => {
  const city = typeof req.query.city === 'string' ? req.query.city.trim() : undefined;
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : undefined;
  const country = typeof req.query.country === 'string' ? req.query.country.trim() : undefined; // <-- Add country

  const min_discount_raw = req.query.min_discount;
  const min_discount =
    typeof min_discount_raw === 'string' && min_discount_raw.trim() !== ''
      ? Math.max(0, Math.min(100, Number(min_discount_raw)))
      : undefined;

  const page = Number.parseInt(String(req.query.page ?? '1'), 10) || 1;
  const limit = Number.parseInt(String(req.query.limit ?? '12'), 10) || 12;

  const result = await memberService.findRestaurantOffers({
    city, q, min_discount, page, limit, country
  });

  res.json(result);
});






export const createDeactivationRequestController = handleAsyncRequest(async (req: Request, res: Response): Promise<void> => {
  const memberId = (req as MemberAuthRequest).member!.id;
  const { reason, note } = (req.body || {}) as { reason?: string; note?: string };
  const doc = await memberService.createDeactivationRequest({ memberId, reason, note });
  res.status(201).json({ id: doc._id, status: doc.status, createdAt: doc.createdAt });
});

export const myDeactivationRequestsController = handleAsyncRequest(async (req: Request, res: Response): Promise<void> => {
  const memberId = (req as MemberAuthRequest).member!.id;
  const items = await memberService.listMyDeactivationRequests(memberId);
  res.json(items);
});

export const listDeactivationRequestsController = handleAsyncRequest(async (req: Request, res: Response): Promise<void> => {
  const status =
    typeof req.query.status === 'string' && ['pending', 'accepted', 'rejected'].includes(req.query.status)
      ? (req.query.status as 'pending' | 'accepted' | 'rejected')
      : undefined;

  const q = typeof req.query.q === 'string' ? req.query.q : undefined;
  const page = Number.parseInt(String(req.query.page ?? '1'), 10) || 1;
  const limit = Number.parseInt(String(req.query.limit ?? '20'), 10) || 20;

  const data = await memberService.listDeactivationRequests({ status, q, page, limit });
  res.json(data);
});

export const acceptDeactivationRequestController = handleAsyncRequest(async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
  const processedBy = (req.headers['x-api-key'] as string) || undefined;
  const processedNote = typeof req.body?.note === 'string' ? req.body.note : undefined;

  const data = await memberService.acceptDeactivationRequest(id, processedBy, processedNote);
  res.json(data);
});



export const addLeadController = handleAsyncRequest(async (req: Request, res: Response): Promise<void> => {

  const { memberId, ownerId } = (req.body || {}) as { memberId?: string, ownerId?: string };
  if (!memberId) { res.status(400).json({ message: 'Field "memberId" is required' }); return; }
  if (!ownerId) { res.status(400).json({ message: 'Field "ownerId" is required' }); return; }

  try {
    const data = await memberService.addLead(ownerId, memberId);
    res.status(201).json(data);
  } catch (e: any) {
    const msg = e?.message || 'Failed to add lead';
    if (msg === 'Already added as lead') { res.status(409).json({ message: msg }); return; }
    if (msg === 'Member not found') { res.status(404).json({ message: msg }); return; }
    res.status(400).json({ message: msg });
  }
});

export const removeLeadController = handleAsyncRequest(async (req: Request, res: Response): Promise<void> => {
  const ownerId = req.query.ownerId?.toString();
  if (!ownerId) { res.status(400).json({ message: 'Field "ownerId" is required' }); return; }

  const leadMemberId = req.params.memberId;
  if (!leadMemberId) { res.status(400).json({ message: 'Param "memberId" is required' }); return; }

  try {
    const data = await memberService.removeLead(ownerId, leadMemberId);
    res.json(data);
  } catch (e: any) {
    const msg = e?.message || 'Failed to remove lead';
    if (msg === 'Lead not found') { res.status(404).json({ message: msg }); return; }
    res.status(400).json({ message: msg });
  }
});

export const listMyLeadsController = handleAsyncRequest(async (req: Request, res: Response): Promise<void> => {
  const ownerId = req.query.ownerId?.toString();
  if (!ownerId) { res.status(400).json({ message: 'Field "ownerId" is required' }); return; }

  const q = typeof req.query.q === 'string' ? req.query.q : undefined;
  const page = Number.parseInt(String(req.query.page ?? '1'), 10) || 1;
  const limit = Number.parseInt(String(req.query.limit ?? '20'), 10) || 20;

  const data = await memberService.listMyLeads({ ownerMemberId: ownerId, q, page, limit });
  res.json(data);
});



export const sendPromotionToLeadsController = handleAsyncRequest(
  async (req: Request, res: Response): Promise<void> => {

    const { offerId, subject, message, ownerId } = (req.body || {}) as {
      offerId?: string;
      subject?: string;
      message?: string;
      ownerId?: string;
    };

    if (!offerId) {
      res.status(400).json({ message: 'Field "offerId" is required' });
      return;
    }

    const result = await memberService.sendPromotionToLeads({
      ownerMemberId: ownerId,
      offerId,
      subject,
      message,
    });

    res.json(result);
  }
);