import { crudList, crudCreate } from '$lib/server/crud.js';

export const GET = () => crudList('expenses');
export const POST = (event) => crudCreate(event, 'expenses', 'EXP', ['purpose', 'method', 'amount', 'date', 'status', 'proof']);
