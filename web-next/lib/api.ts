import { PictoclashClientImpl } from "@/pb/pictoclash";

interface TwirpError {
	code: string;
	msg: string;
	meta: object;
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8007/twirp";

async function rpcRequest(
	service: string,
	method: string,
	data: Uint8Array,
	headers: Record<string, string>,
): Promise<Uint8Array> {
	const response = await fetch(`${baseUrl}/${service}/${method}`, {
		body: data,
		headers: {
			...headers,
			"Content-Type": "application/protobuf",
			Accept: "application/protobuf",
		},
		method: "POST",
		mode: "cors",
	});

	switch (response.headers.get("Content-Type")) {
		case "application/protobuf":
			const buf = await response.arrayBuffer();
			return new Uint8Array(buf);
		case "application/json":
			let twirpErr: TwirpError;
			try {
				twirpErr = await response.json();
			} catch (err) {
				console.error(err);
				throw await response.text();
			}
			throw twirpErr;
		default:
			throw "unexpected MIME type";
	}
}

export const api = new PictoclashClientImpl({
	request: (service, method, data) => rpcRequest(service, method, data, {}),
});

export const devAPI = new PictoclashClientImpl({
	request: (service, method, data) =>
		rpcRequest(service, method, data, { "X-Current-User-Id": "testing-user-id" }),
});
