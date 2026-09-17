import { crudUpdate, crudDelete } from '$lib/server/crud.js';

export const PUT = (event) => crudUpdate(event, 'expenses', ['purpose', 'method', 'amount', 'date', 'status', 'proof']);
export const DELETE = (event) => crudDelete(event, 'expenses');
