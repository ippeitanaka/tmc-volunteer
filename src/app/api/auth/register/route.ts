import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type RegistrationRequest = {
  studentNumber?: unknown;
  name?: unknown;
  password?: unknown;
};

function studentEmail(studentNumber: string) {
  return `${studentNumber.toLowerCase()}@students.tmc-volunteer.local`;
}

export async function POST(request: Request) {
  let body: RegistrationRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "入力内容を確認してください。" }, { status: 400 });
  }

  const studentNumber = typeof body.studentNumber === "string" ? body.studentNumber.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!studentNumber || !name) {
    return NextResponse.json({ error: "学籍番号と氏名を入力してください。" }, { status: 400 });
  }

  if (!/^[a-zA-Z0-9_-]{3,64}$/.test(studentNumber)) {
    return NextResponse.json({ error: "学籍番号は英数字・ハイフン・アンダースコアで入力してください。" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "パスワードは8文字以上で入力してください。" }, { status: 400 });
  }

  try {
    const admin = getSupabaseAdmin();
    const { data: existingProfile, error: lookupError } = await admin
      .from("users")
      .select("id")
      .eq("student_number", studentNumber)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (existingProfile) {
      return NextResponse.json(
        { error: "この学籍番号はすでに登録されています。" },
        { status: 409 },
      );
    }

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: studentEmail(studentNumber),
      password,
      email_confirm: true,
      user_metadata: { student_number: studentNumber, name },
    });

    if (createError || !created.user) {
      if (createError?.message.toLowerCase().includes("already")) {
        return NextResponse.json(
          { error: "この学籍番号はすでに登録されています。" },
          { status: 409 },
        );
      }
      throw createError ?? new Error("Auth user creation failed.");
    }

    const { error: profileError } = await admin.from("users").insert({
      id: created.user.id,
      student_number: studentNumber,
      name,
      role: "student",
      verification_status: "unverified",
      account_status: "active",
    });

    if (profileError) {
      await admin.auth.admin.deleteUser(created.user.id);
      if (profileError.code === "23505") {
        return NextResponse.json(
          { error: "この学籍番号はすでに登録されています。" },
          { status: 409 },
        );
      }
      throw profileError;
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Student registration failed", error);
    return NextResponse.json(
      { error: "登録処理に失敗しました。しばらくしてからもう一度お試しください。" },
      { status: 500 },
    );
  }
}