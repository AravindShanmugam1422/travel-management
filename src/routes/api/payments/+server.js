import { crudList, crudCreate } from '$lib/server/crud.js';

export const GET = () => crudList('payments');
export const POST = (event) => crudCreate(event, 'payments', 'PAY', ['name', 'method', 'amount', 'date', 'status', 'proof']);
