export function stringify(obj: unknown): string {
	if (typeof obj === "object" && !Array.isArray(obj) && obj !== null) {
		return JSON.stringify(obj, undefined, 2);
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => stringify(item)).join("\n");
	}

	return obj?.toString() || "undefined";
}
