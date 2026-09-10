/** Get live forex rate to convert `currency` -> INR. Returns 1 for INR or on failure. */
export async function getForexRateToINR(currency) {
	if (!currency || currency.toUpperCase() === 'INR') return 1;
	try {
		const res = await fetch(
			`https://api.frankfurter.app/latest?from=${encodeURIComponent(currency)}&to=INR`
		);
		if (!res.ok) return 1;
		const data = await res.json();
		return data?.rates?.INR ?? 1;
	} catch {
		return 1;
	}
}
