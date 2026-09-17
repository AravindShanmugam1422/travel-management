import { crudUpdate, crudDelete } from '$lib/server/crud.js';

export const PUT = (event) => crudUpdate(event, 'payments', ['name', 'method', 'amount', 'date', 'status', 'proof']);
export const DELETE = (event) => crudDelete(event, 'payments');
