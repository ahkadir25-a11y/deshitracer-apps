import { JwtPayload } from 'jsonwebtoken';
import { EODReport } from './eodReport.model';
import { TEODReport } from './eodReport.interface';

const submitEODReport = async (payload: Partial<TEODReport>, decodedUser: JwtPayload) => {
  const result = await EODReport.create({
    ...payload,
    manager: decodedUser.id
  });
  return result;
};

const getEODReportsByBusiness = async (businessId: string) => {
  const result = await EODReport.find({ business: businessId })
    .populate('manager', 'name email')
    .sort({ date: -1 });
  return result;
};

export const EODServices = {
  submitEODReport,
  getEODReportsByBusiness
};
