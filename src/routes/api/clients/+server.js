import { crudList, crudCreate } from '$lib/server/crud.js';

export const GET = () => crudList('clients');
export const POST = (event) => crudCreate(event, 'clients', 'CL', ['name', 'email', 'phone', 'type', 'status']);
