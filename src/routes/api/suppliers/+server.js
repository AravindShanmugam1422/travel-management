import { crudList, crudCreate } from '$lib/server/crud.js';

export const GET = () => crudList('suppliers');
export const POST = (event) => crudCreate(event, 'suppliers', 'SUP', ['name', 'type', 'contact', 'status']);
