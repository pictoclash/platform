"use client";
import { devAPI as api } from "@/lib/api";
import { useEffect } from "react";

export default function Homepage() {
	useEffect(() => {
		api.Noop({}).then(() => console.log("success! hit api from client"));
	}, []);
	return <></>;
}
