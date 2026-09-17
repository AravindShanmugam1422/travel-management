import { crudUpdate, crudDelete } from '$lib/server/crud.js';

export const PUT = (event) => crudUpdate(event, 'suppliers', ['name', 'type', 'contact', 'status']);
export const DELETE = (event) => crudDelete(event, 'suppliers');
