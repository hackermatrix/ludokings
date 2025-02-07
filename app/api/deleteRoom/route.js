import { NextRequest, NextResponse } from "next/server";
import { deleteroom } from "@/supabaseClient";

export async function POST(NextRequest) {
  try {
    const reqBody = await NextRequest.json();
    const { userId, roomId } = reqBody;

    const response = deleteroom(userId, roomId);

    return NextResponse.json("Room deleted");
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred at deleteRoom server: " + error.message },
      { status: 500 }
    );
  }
}
