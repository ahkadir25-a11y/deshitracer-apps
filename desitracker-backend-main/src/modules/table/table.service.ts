import AppError from '../../errors/AppError';
import { Table } from './table.model';
import { ITable } from './table.interface';
import { getSocketIO } from '../../utils/socket';
import { Types } from 'mongoose';
import { Business } from '../business/business.model';

// The access token carries only { id, role, email } — it has NO business_id.
// So table routes must resolve the business from the TABLE itself and then
// verify the caller owns that business. Reading business_id off req.user made
// every lookup run with business_id: undefined, which is why delete/edit
// answered "Table not found".
const loadOwnedTable = async (userId: string, role: string, tableId: string) => {
  if (!Types.ObjectId.isValid(tableId)) {
    throw new AppError(400, 'Invalid table id');
  }

  const table = await Table.findById(tableId);
  if (!table) {
    throw new AppError(404, 'Table not found');
  }

  if (role !== 'admin') {
    const business = await Business.findById(table.business_id).select('owner');
    if (!business || String(business.owner) !== String(userId)) {
      throw new AppError(403, 'You do not own this business');
    }
  }

  return table;
};

const createTable = async (
  business_id: string,
  payload: Partial<ITable>,
  actor?: { id: string; role: string },
) => {
  if (!business_id || !Types.ObjectId.isValid(String(business_id))) {
    throw new AppError(400, 'A valid business id is required');
  }

  // Only the owner of that business (or an admin) may add tables to it.
  if (actor && actor.role !== 'admin') {
    const business = await Business.findById(business_id).select('owner');
    if (!business || String(business.owner) !== String(actor.id)) {
      throw new AppError(403, 'You do not own this business');
    }
  }

  const isExists = await Table.findOne({ business_id, tableNo: payload.tableNo });
  if (isExists) {
    throw new AppError(400, 'Table number already exists for this business');
  }

  const result = await Table.create({ ...payload, business_id });
  
  // Broadcast table added
  const io = getSocketIO();
  io.to(`business_${business_id}`).emit('table_added', result);

  return result;
};

const getBusinessTables = async (business_id: string) => {
  const result = await Table.find({ business_id }).sort({ tableNo: 1 }).populate('activeOrderId');
  return result;
};

const updateTableStatus = async (business_id: string, tableId: string, status: string, activeOrderId: any = null) => {
  const result = await Table.findOneAndUpdate(
    { _id: tableId, business_id },
    { status, activeOrderId },
    { new: true }
  ).populate('activeOrderId');

  if (!result) {
    throw new AppError(404, 'Table not found');
  }

  // Broadcast table status update
  const io = getSocketIO();
  io.to(`business_${business_id}`).emit('table_updated', result);

  return result;
};

const deleteTable = async (userId: string, role: string, tableId: string) => {
  const table = await loadOwnedTable(userId, role, tableId);

  if (table.status !== 'AVAILABLE') {
    throw new AppError(400, 'Cannot delete a table that is still in use');
  }
  if (table.activeOrderId) {
    throw new AppError(400, 'Cannot delete a table with an open order');
  }

  const business_id = String(table.business_id);
  const result = await Table.findByIdAndDelete(tableId);

  const io = getSocketIO();
  io.to(`business_${business_id}`).emit('table_deleted', { tableId });

  return result;
};

// Rename a table / change its seat count. Status and activeOrderId are
// deliberately NOT editable here — those are driven by the order flow.
const updateTable = async (
  userId: string,
  role: string,
  tableId: string,
  payload: { tableNo?: string; capacity?: number },
) => {
  const table = await loadOwnedTable(userId, role, tableId);
  const business_id = String(table.business_id);

  const update: { tableNo?: string; capacity?: number } = {};

  if (payload.tableNo !== undefined) {
    const tableNo = String(payload.tableNo).trim();
    if (!tableNo) {
      throw new AppError(400, 'Table number is required');
    }
    if (tableNo !== table.tableNo) {
      const clash = await Table.findOne({
        business_id: table.business_id,
        tableNo,
        _id: { $ne: table._id },
      });
      if (clash) {
        throw new AppError(400, 'Table number already exists for this business');
      }
    }
    update.tableNo = tableNo;
  }

  if (payload.capacity !== undefined) {
    const capacity = Number(payload.capacity);
    if (!Number.isFinite(capacity) || capacity < 1) {
      throw new AppError(400, 'Capacity must be at least 1');
    }
    update.capacity = capacity;
  }

  const result = await Table.findByIdAndUpdate(tableId, update, {
    new: true,
  }).populate('activeOrderId');

  const io = getSocketIO();
  io.to(`business_${business_id}`).emit('table_updated', result);

  return result;
};

export const TableServices = {
  createTable,
  getBusinessTables,
  updateTableStatus,
  updateTable,
  deleteTable,
};
