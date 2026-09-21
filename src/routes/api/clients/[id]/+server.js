import { crudUpdate, crudDelete } from '$lib/server/crud.js';

export const PUT = (event) => crudUpdate(event, 'clients', ['name', 'email', 'phone', 'type', 'status', 'assigned_agent_id', 'passengers']);
export const DELETE = (event) => crudDelete(event, 'clients');
