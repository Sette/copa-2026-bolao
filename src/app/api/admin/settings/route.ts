import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import fs from "fs";
import path from "path";

const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json");

function readSettings(): { registrationEnabled: boolean } {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
    }
  } catch {
    // ignore
  }
  return { registrationEnabled: true };
}

function writeSettings(settings: { registrationEnabled: boolean }) {
  const dir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

export async function GET() {
  const session = await auth();
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",");
  if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const settings = readSettings();
  return NextResponse.json(settings);
}

export async function POST(req: Request) {
  const session = await auth();
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",");
  if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { registrationEnabled } = await req.json();
  const settings = { registrationEnabled: !!registrationEnabled };
  writeSettings(settings);
  return NextResponse.json(settings);
}
