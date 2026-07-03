import AppError from '../../errors/AppError';
import { Table } from './table.model';
import { ITable } from './table.interface';
import { getSocketIO } from '../../utils/socket';
import { Types } from 'mongoose';

const createTable = async (business_id: string, payload: Partial<ITable>) => {
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

const deleteTable = async (business_id: string, tableId: string) => {
  const table = await Table.findOne({ _id: tableId, business_id });
  if (!table) {
    throw new AppError(404, 'Table not found');
  }
  
  if (table.status !== 'AVAILABLE') {
    throw new AppError(400, 'Cannot delete an occupied table');
  }

  const result = await Table.findByIdAndDelete(tableId);

  const io = getSocketIO();
  io.to(`business_${business_id}`).emit('table_deleted', { tableId });

  return result;
};

export const TableServices = {
  createTable,
  getBusinessTables,
  updateTableStatus,
  deleteTable,
};
