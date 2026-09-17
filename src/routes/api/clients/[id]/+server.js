import { crudUpdate, crudDelete } from '$lib/server/crud.js';

export const PUT = (event) => crudUpdate(event, 'clients', ['name', 'email', 'phone', 'type', 'status']);
export const DELETE = (event) => crudDelete(event, 'clients');
