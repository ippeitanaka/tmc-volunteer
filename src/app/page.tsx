"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import {
  Award,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  Eye,
  EyeOff,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Medal,
  NotebookPen,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Stamp,
  Trophy,
  Users,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

type Role = "student" | "admin";
type Screen =
  | "home"
  | "stamps"
  | "history"
  | "event"
  | "sharedMemos"
  | "ranking"
  | "profile"
  | "dashboard"
  | "events"
  | "stampAdmin"
  | "award"
  | "users"
  | "memos"
  | "settings"
  | "awards"
  | "logs";
type Record = {
  id: string | number;
  title: string;
  date: string;
  location: string;
  hours: number;
  points: number;
  code: string;
  category: string;
  memo: string;
};
type UserProfile = {
  id: string;
  name: string;
  student_number: string | null;
  nickname: string | null;
  role: Role;
};

const activity: Record[] = [
  {
    id: 1,
    title: "明石国際アクアスロン",
    date: "2026年7月12日",
    location: "明石市大蔵海岸",
    hours: 5,
    points: 20,
    code: "AQUA",
    category: "スポーツ",
    memo: "公開中",
  },
  {
    id: 2,
    title: "地域防災訓練",
    date: "2026年6月21日",
    location: "東播磨防災センター",
    hours: 3,
    points: 15,
    code: "SAFE",
    category: "防災",
    memo: "公開申請中",
  },
  {
    id: 3,
    title: "夏祭り救護",
    date: "2026年6月7日",
    location: "魚住住民センター",
    hours: 4,
    points: 18,
    code: "CARE",
    category: "救護",
    memo: "非公開",
  },
  {
    id: 4,
    title: "地域清掃活動",
    date: "2026年5月18日",
    location: "明石駅周辺",
    hours: 2,
    points: 10,
    code: "CLEAN",
    category: "地域活動",
    memo: "差し戻し",
  },
  {
    id: 5,
    title: "救命講習サポート",
    date: "2026年4月26日",
    location: "校内実習棟",
    hours: 3,
    points: 15,
    code: "LIFE",
    category: "救護",
    memo: "公開中",
  },
];
const students = [
  "佐藤 美咲",
  "山本 悠斗",
  "鈴木 花",
  "高橋 蓮",
  "田中 一平",
  "伊藤 結菜",
  "渡辺 陽向",
  "中村 海斗",
  "小林 さくら",
  "加藤 蒼",
].map((name, i) => ({
  name,
  number: `TMC26${String(i + 1).padStart(3, "0")}`,
  stamps: 19 - i,
  points: 265 - i * 18,
  hours: 38 - i * 2,
}));
const adminMenu: { id: Screen; label: string; icon: LucideIcon }[] = [
  ["dashboard", "ダッシュボード", LayoutDashboard],
  ["events", "ボランティア管理", CalendarDays],
  ["stampAdmin", "スタンプ管理", Stamp],
  ["award", "スタンプ付与", Sparkles],
  ["users", "ユーザー管理", Users],
  ["memos", "活動メモ管理", NotebookPen],
  ["settings", "ランキング設定", Settings],
  ["awards", "表彰管理", Award],
  ["logs", "操作履歴", ClipboardCheck],
].map(([id, label, icon]) => ({
  id: id as Screen,
  label: label as string,
  icon: icon as LucideIcon,
}));
const colors = [
  "border-orange-500 bg-orange-50 text-orange-700",
  "border-sky-500 bg-sky-50 text-sky-700",
  "border-emerald-500 bg-emerald-50 text-emerald-700",
  "border-rose-500 bg-rose-50 text-rose-700",
  "border-violet-500 bg-violet-50 text-violet-700",
];

function Logo() {
  return (
    <Image
      src="/tmc-volunteer-logo.png"
      alt="TMC Volunteer ロゴ"
      width={40}
      height={40}
      className="size-10 rounded-full object-contain"
    />
  );
}
function Btn({
  children,
  onClick,
  style = "main",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  style?: "main" | "line" | "plain" | "danger";
  disabled?: boolean;
}) {
  const styles = {
    main: "bg-orange-500 text-white hover:bg-orange-600",
    line: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    plain: "text-slate-600 hover:bg-slate-100",
    danger: "bg-red-500 text-white",
  };
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition disabled:opacity-50 ${styles[style]}`}
    >
      {children}
    </button>
  );
}
function Card({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-slate-800">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
      <Check size={12} />
      {children}
    </span>
  );
}
function Seal({
  code,
  i = 0,
  large = false,
}: {
  code: string;
  i?: number;
  large?: boolean;
}) {
  return (
    <span
      className={`grid shrink-0 rotate-[-4deg] place-items-center rounded-full border-4 border-dashed text-center font-black tracking-wide ${large ? "size-24 text-base" : "size-14 text-[10px]"} ${colors[i % colors.length]}`}
    >
      {code}
    </span>
  );
}

async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("users")
    .select("id, name, student_number, nickname, role")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as UserProfile | null;
}

async function getParticipationRecords(userId: string): Promise<Record[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("participations")
    .select(
      "id, activity_hours, points, awarded_at, status, volunteer_events(title, event_date, location, category, stamps(display_text))",
    )
    .eq("user_id", userId)
    .eq("status", "awarded")
    .order("awarded_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).flatMap((participation) => {
    const event = Array.isArray(participation.volunteer_events)
      ? participation.volunteer_events[0]
      : participation.volunteer_events;
    const rawStamp = event?.stamps;
    const stamp = Array.isArray(rawStamp) ? rawStamp[0] : rawStamp;

    if (!event) return [];

    return [{
      id: participation.id,
      title: event.title,
      date: new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(`${event.event_date}T00:00:00+09:00`)),
      location: event.location,
      hours: Number(participation.activity_hours),
      points: participation.points,
      code: stamp?.display_text ?? "TMC",
      category: event.category,
      memo: "未入力",
    }];
  });
}

type AdminDashboardData = {
  studentCount: number;
  monthlyStudentCount: number;
  monthlyParticipationCount: number;
  unverifiedCount: number;
  pendingMemoCount: number;
  upcomingEvents: { id: string; title: string; event_date: string }[];
  recentLogs: { id: string; action: string; created_at: string }[];
};

async function getAdminDashboardData(): Promise<AdminDashboardData> {
  if (!supabase) throw new Error("Supabase is not configured");

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const today = new Date().toISOString().slice(0, 10);
  const [students, participations, unverifiedUsers, pendingMemos, events, logs] =
    await Promise.all([
      supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("role", "student"),
      supabase
        .from("participations")
        .select("user_id")
        .eq("status", "awarded")
        .gte("awarded_at", monthStart.toISOString()),
      supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("role", "student")
        .in("verification_status", ["unverified", "needs_review"]),
      supabase
        .from("activity_memos")
        .select("id", { count: "exact", head: true })
        .eq("visibility", "pending"),
      supabase
        .from("volunteer_events")
        .select("id, title, event_date")
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .limit(3),
      supabase
        .from("audit_logs")
        .select("id, action, created_at")
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

  const result = [students, participations, unverifiedUsers, pendingMemos, events, logs];
  const failed = result.find(({ error }) => error);
  if (failed?.error) throw failed.error;

  const participationRows = participations.data ?? [];
  return {
    studentCount: students.count ?? 0,
    monthlyStudentCount: new Set(participationRows.map((row) => row.user_id)).size,
    monthlyParticipationCount: participationRows.length,
    unverifiedCount: unverifiedUsers.count ?? 0,
    pendingMemoCount: pendingMemos.count ?? 0,
    upcomingEvents: events.data ?? [],
    recentLogs: logs.data ?? [],
  };
}

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("home");
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | number | null>(null);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [ranking, setRanking] = useState(true);
  const [dialog, setDialog] = useState<"award" | "delete" | "stop" | null>(
    null,
  );
  const [chosen, setChosen] = useState<string[]>([]);
  const note = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(""), 2600);
  };
  const go = (next: Screen) => {
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (!supabase) {
        if (active) setAuthLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
          const restoredProfile = await getUserProfile(session.user.id);
          if (active) setProfile(restoredProfile);
        } catch {
          await supabase.auth.signOut();
        }
      }

      if (active) setAuthLoading(false);
    }

    void restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const role = profile?.role ?? null;

  useEffect(() => {
    let active = true;

    async function loadRecords() {
      if (!profile || profile.role !== "student") {
        if (active) setRecords([]);
        return;
      }

      setRecordsLoading(true);
      try {
        const loadedRecords = await getParticipationRecords(profile.id);
        if (active) setRecords(loadedRecords);
      } catch {
        if (active) {
          setRecords([]);
          note("活動記録を取得できませんでした。");
        }
      } finally {
        if (active) setRecordsLoading(false);
      }
    }

    void loadRecords();
    return () => {
      active = false;
    };
  }, [profile]);

  if (authLoading) {
    return <main className="grid min-h-screen place-items-center bg-slate-100"><p className="rounded-xl bg-white px-5 py-4 text-sm font-bold text-slate-600 shadow-sm">ログイン情報を確認しています...</p></main>;
  }

  if (!profile)
    return (
      <Login
        onLogin={(nextProfile: UserProfile) => {
          setProfile(nextProfile);
          go(nextProfile.role === "admin" ? "dashboard" : "home");
          note("ログインしました");
        }}
      />
    );
  const studentMenu: { id: Screen; label: string; icon: LucideIcon }[] = [
    { id: "home", label: "ホーム", icon: LayoutDashboard },
    { id: "stamps", label: "スタンプ帳", icon: Stamp },
    { id: "history", label: "活動履歴", icon: CalendarDays },
    { id: "sharedMemos", label: "共有メモ", icon: NotebookPen },
    { id: "ranking", label: "ランキング", icon: Trophy },
    { id: "profile", label: "マイページ", icon: Users },
  ];
  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <header className="sticky top-0 z-30 bg-slate-900 text-white shadow">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <button
            onClick={() => go(role === "admin" ? "dashboard" : "home")}
            className="flex items-center gap-3 text-left"
          >
            <Logo />
            <span>
              <b className="block text-sm">TMC ボランティア</b>
              <small className="text-[10px] text-slate-300">
                東洋医療専門学校
              </small>
            </span>
          </button>
          <div className="flex items-center gap-2">
            <span className="hidden text-right text-xs sm:block">
              <b className="block text-sm">
                {profile.name}
              </b>
              {role === "admin" ? "管理者" : profile.student_number}
            </span>
            <Btn
              style="plain"
              onClick={async () => {
                await supabase?.auth.signOut();
                setProfile(null);
                note("ログアウトしました");
              }}
            >
              <LogOut size={17} />
              <span className="hidden sm:inline">ログアウト</span>
            </Btn>
          </div>
        </div>
        {role === "student" && (
          <nav className="mx-auto hidden max-w-7xl md:flex">
            {studentMenu.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => go(id)}
                className={`border-b-2 px-4 py-3 text-sm font-bold ${screen === id ? "border-orange-500 text-orange-400" : "border-transparent text-slate-300"}`}
              >
                {label}
              </button>
            ))}
          </nav>
        )}
      </header>
      <main className="mx-auto max-w-7xl p-4 md:p-7">
        {role === "student" ? (
          <Student
            screen={screen}
            go={go}
            records={records}
            setRecords={setRecords}
            selectedRecordId={selectedRecordId}
            setSelectedRecordId={setSelectedRecordId}
            ranking={ranking}
            note={note}
            profile={profile}
            recordsLoading={recordsLoading}
          />
        ) : (
          <Admin
            screen={screen}
            go={go}
            note={note}
            ranking={ranking}
            setRanking={setRanking}
            chosen={chosen}
            setChosen={setChosen}
            setDialog={setDialog}
            profile={profile}
          />
        )}
      </main>
      {role === "student" && (
        <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 justify-around border-t border-slate-200 bg-white md:hidden">
          {studentMenu.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => go(id)}
              className={`grid min-w-14 place-items-center text-[10px] font-bold ${screen === id ? "text-orange-500" : "text-slate-500"}`}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </nav>
      )}
      {toast && (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-xl md:bottom-6"
        >
          <Check size={17} className="text-emerald-400" />
          {toast}
        </div>
      )}
      {dialog && (
        <Dialog
          kind={dialog}
          close={() => setDialog(null)}
          confirm={() => {
            note(
              dialog === "award"
                ? `${chosen.length}名へスタンプを付与しました`
                : "操作を記録しました",
            );
            setDialog(null);
          }}
        />
      )}
    </div>
  );
}

function Login({ onLogin }: { onLogin: (profile: UserProfile) => void }) {
  const [register, setRegister] = useState(false);
  const [adminLogin, setAdminLogin] = useState(false);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    number: "",
    password: "",
    name: "",
    confirm: "",
    agreed: false,
  });
  const [error, setError] = useState("");
  const input =
    "mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100";
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (register) {
      if (!form.number || !form.name)
        return setError("学籍番号と氏名を入力してください");
      if (form.password.length < 8)
        return setError("パスワードは8文字以上で入力してください");
      if (form.password !== form.confirm)
        return setError("パスワードと確認用パスワードが一致しません");
      if (!form.agreed) return setError("利用上の注意への同意が必要です");

      setBusy(true);
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentNumber: form.number,
            name: form.name,
            password: form.password,
          }),
        });
        const result = (await response.json()) as { error?: string };

        if (!response.ok) {
          setError(result.error ?? "登録処理に失敗しました。");
          return;
        }

        setRegister(false);
        setForm({ ...form, name: "", confirm: "", agreed: false });
        setError("登録が完了しました。ログインしてください。");
      } catch {
        setError("通信に失敗しました。接続を確認してもう一度お試しください。");
      } finally {
        setBusy(false);
      }

      return;
    }

    if (!supabase || !isSupabaseConfigured) {
      setError("Supabase の接続設定が不足しています。管理者へお問い合わせください。");
      return;
    }

    const identifier = form.number.trim();
    if (adminLogin && !identifier.includes("@")) {
      setError("管理者のメールアドレスを入力してください。");
      return;
    }

    const email = identifier.includes("@")
      ? identifier.toLowerCase()
      : `${identifier.toLowerCase()}@students.tmc-volunteer.local`;

    setBusy(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: form.password,
      });

      if (signInError || !data.user) {
        setError("学籍番号またはパスワードを確認してください。");
        return;
      }

      const userProfile = await getUserProfile(data.user.id);
      if (!userProfile) {
        await supabase.auth.signOut();
        setError("利用者情報が見つかりません。管理者へお問い合わせください。");
        return;
      }

      if (adminLogin && userProfile.role !== "admin") {
        await supabase.auth.signOut();
        setError("このアカウントには管理者権限がありません。");
        return;
      }

      onLogin(userProfile);
    } catch {
      setError("ログイン処理に失敗しました。しばらくしてからもう一度お試しください。");
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="grid md:grid-cols-2">
          <section className="p-7 sm:p-10">
            <div className="mb-8 flex items-center gap-3">
              <Logo />
              <span>
                <b className="block text-[11px] tracking-[.2em] text-orange-600">
                  TMC VOLUNTEER
                </b>
                <h1 className="text-2xl font-black">TMC ボランティア</h1>
              </span>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <h2 className="text-xl font-black">
                  {register ? "新規登録" : adminLogin ? "管理者ログイン" : "学生ログイン"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {register
                    ? "登録後すぐに利用できます。"
                    : adminLogin
                      ? "管理者のメールアドレスとパスワードを入力してください。"
                    : "活動の記録を、未来の後輩へ。"}
                </p>
              </div>
              <label className="block text-sm font-bold">
                {adminLogin ? "メールアドレス" : "学籍番号"}
                <input
                  type={adminLogin ? "email" : "text"}
                  autoComplete={adminLogin ? "email" : "username"}
                  placeholder={adminLogin ? "admin@example.com" : "TMC26001"}
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  className={input}
                  required
                />
              </label>
              {register && (
                <label className="block text-sm font-bold">
                  氏名
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={input}
                    required
                  />
                </label>
              )}
              <label className="block text-sm font-bold">
                パスワード
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className={input}
                    required
                  />
                  <button
                    type="button"
                    aria-label="パスワードを表示"
                    onClick={() => setShow(!show)}
                    className="absolute right-2 top-3 text-slate-500"
                  >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
              {register && (
                <label className="block text-sm font-bold">
                  パスワード（確認）
                  <input
                    type="password"
                    value={form.confirm}
                    onChange={(e) =>
                      setForm({ ...form, confirm: e.target.value })
                    }
                    className={input}
                    required
                  />
                </label>
              )}
              {register && (
                <label className="flex gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.agreed}
                    onChange={(e) =>
                      setForm({ ...form, agreed: e.target.checked })
                    }
                    className="mt-1 size-4 accent-orange-500"
                  />
                  利用上の注意に同意します
                </label>
              )}
              {error && (
                <p className="rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800">
                  {error}
                </p>
              )}
              <button
                disabled={busy}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? "処理中..." : register ? "登録を完了する" : adminLogin ? "管理者としてログイン" : "ログイン"}
                <ChevronRight size={17} />
              </button>
              {!register && (
                <p className="text-center text-xs text-slate-500">
                  パスワードを忘れた方は、管理者へお問い合わせください
                </p>
              )}
              {register && (
                <button
                  type="button"
                  onClick={() => {
                    setRegister(false);
                    setAdminLogin(false);
                    setError("");
                  }}
                  className="w-full text-sm font-bold text-slate-600"
                >
                  ログインへ戻る
                </button>
              )}
            </form>
          </section>
          <aside className="flex flex-col justify-between gap-10 bg-slate-900 p-7 text-white sm:p-10">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/20 px-3 py-1 text-xs font-bold text-orange-300">
                <Heart size={13} />
                活動を楽しむ記録帳
              </span>
              <h2 className="mt-5 text-2xl font-black">はじめて利用する方へ</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                イベントに参加してスタンプを集め、あなたの経験を次の世代へ残せます。
              </p>
            </div>
            <div>
              <Btn
                disabled={busy}
                onClick={() => {
                  setRegister(true);
                  setAdminLogin(false);
                  setError("");
                }}
              >
                <Plus size={17} />
                新規登録
              </Btn>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setRegister(false);
                  setAdminLogin(!adminLogin);
                  setError("");
                }}
                className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-600 px-4 text-sm font-bold text-slate-100 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShieldCheck size={17} />
                {adminLogin ? "学生ログインへ戻る" : "管理者ログイン"}
              </button>
              <p className="mt-5 text-xs leading-6 text-slate-400">
                {adminLogin
                  ? "管理者として登録済みのアカウントのみ利用できます。"
                  : "ログイン情報は学校から配布されたものを使用してください。"}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Student({ screen, go, records, setRecords, selectedRecordId, setSelectedRecordId, ranking, note, profile, recordsLoading }: any) {
  if (screen === "home")
    return <Home go={go} records={records} ranking={ranking} profile={profile} loading={recordsLoading} />;
  if (screen === "stamps") return <Stamps go={go} records={records} />;
  if (screen === "history") return <History go={go} records={records} setSelectedRecordId={setSelectedRecordId} />;
  if (screen === "sharedMemos") return <SharedMemos />;
  if (screen === "event" && records.length > 0)
    return (
      <Event record={records.find((record: Record) => record.id === selectedRecordId) ?? records[0]} go={go} setRecords={setRecords} note={note} profile={profile} />
    );
  if (screen === "event") return <EmptyActivities go={go} />;
  if (screen === "ranking") return <Ranking visible={ranking} hasActivities={records.length > 0} />;
  return <Profile note={note} profile={profile} records={records} />;
}
function Home({ go, records, ranking, profile, loading }: any) {
  const stampCount = records.length;
  const pointTotal = records.reduce((total: number, record: Record) => total + record.points, 0);
  const activityHours = records.reduce((total: number, record: Record) => total + record.hours, 0);
  const monthStampCount = records.filter((record: Record) => record.date.includes("7月")).length;
  const nextAward = stampCount < 5 ? 5 : stampCount < 10 ? 10 : stampCount < 20 ? 20 : 30;
  const nextAwardName = nextAward === 5 ? "ブロンズボランティア賞" : nextAward === 10 ? "シルバーボランティア賞" : nextAward === 20 ? "ゴールドボランティア賞" : "TMCボランティアマスター賞";
  const progress = Math.min((stampCount / nextAward) * 100, 100);
  const data = [
    ["累計スタンプ", stampCount, "個", Stamp],
    ["今月のスタンプ", monthStampCount, "個", Sparkles],
    ["今年度のスタンプ", stampCount, "個", Award],
    ["累計ポイント", pointTotal, "pt", Zap],
    ["累計活動時間", activityHours, "時間", CalendarDays],
  ];
  return (
    <div className="space-y-6">
      <div>
        <p className="font-bold text-orange-600">2026年度</p>
        <h1 className="text-2xl font-black sm:text-3xl">
          {profile.name}さん、おかえりなさい！
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          次の活動も、あなたの力を待っています。
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {data.map(([label, num, unit, Icon]: any) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <Icon className="text-orange-500" size={20} />
            <p className="mt-3 text-xs font-bold text-slate-500">{label}</p>
            <p className="text-2xl font-black">
              {loading ? "-" : num}
              <small className="ml-1 text-xs">{unit}</small>
            </p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <Card title="次の表彰までの進捗" className="lg:col-span-3">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
            <Seal code={nextAward === 5 ? "BRONZE" : nextAward === 10 ? "SILVER" : nextAward === 20 ? "GOLD" : "MASTER"} i={nextAward === 5 ? 0 : nextAward === 10 ? 1 : 2} large />
            <div className="min-w-0 flex-1">
              <b>
                現在 <span className="text-orange-600">{loading ? "-" : `${stampCount}スタンプ`}</span>
              </b>
              <p className="mt-2 break-words text-sm leading-6 text-slate-500">
                {nextAwardName}まであと{Math.max(nextAward - stampCount, 0)}スタンプ
              </p>
              <div className="mt-4 h-3 w-full max-w-80 overflow-hidden rounded-full bg-slate-100">
                <div style={{ width: `${progress}%` }} className="h-full bg-orange-500" />
              </div>
              <small className="mt-1 block text-slate-500">
                {stampCount} / {nextAward} スタンプ
              </small>
            </div>
          </div>
        </Card>
        <Card title="お知らせ" className="lg:col-span-2">
          <ul className="space-y-3 text-sm">
            {[
              "新しいボランティアスタンプが追加されました",
              "年間表彰の対象者が発表されました",
              "公開された活動メモがあります",
            ].map((x, i) => (
              <li className="flex min-w-0 items-start gap-2" key={x}>
                <Bell size={15} className="mt-0.5 shrink-0 text-orange-500" />
                <span className="min-w-0 break-words leading-6">
                  <b className="font-bold text-slate-700">{x}</b>
                  <small className="ml-2 whitespace-nowrap text-slate-500">
                    7月{18 - i * 3}日
                  </small>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <Card
        title="最近獲得したスタンプ"
        action={
          <Btn style="plain" onClick={() => go("stamps")}>
            すべて見る
            <ChevronRight size={16} />
          </Btn>
        }
      >
        {loading ? <p className="text-sm text-slate-500">活動記録を読み込んでいます...</p> : records.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">まだ獲得したスタンプはありません。ボランティアへ参加すると、ここに活動記録が表示されます。</p> : <div className="grid gap-3 md:grid-cols-3">
          {records.slice(0, 3).map((r: Record, i: number) => (
            <button
              key={r.id}
              onClick={() => go("event")}
              className="flex items-center gap-4 rounded-xl border border-slate-200 p-3 text-left hover:border-orange-300"
            >
              <Seal code={r.code} i={i} />
              <span>
                <b className="block text-sm">{r.title}</b>
                <small className="block text-slate-500">{r.date}</small>
                <small className="flex gap-1 text-slate-500">
                  <MapPin size={12} />
                  {r.location}
                </small>
                <strong className="text-sm text-orange-600">
                  +{r.points}pt
                </strong>
              </span>
            </button>
          ))}
        </div>}
      </Card>
      {ranking && (
        <Card title="あなたのランキング">
          {stampCount === 0 ? <p className="text-sm text-slate-500">活動実績がまだないため、ランキング順位は表示されません。</p> : <div className="grid grid-cols-3 divide-x text-center">
            <p>
              <small className="block text-slate-500">今月</small>
              <b className="text-2xl">5位</b>
            </p>
            <p>
              <small className="block text-slate-500">年間</small>
              <b className="text-2xl">4位</b>
            </p>
            <p>
              <small className="block text-slate-500">累計</small>
              <b className="text-2xl">6位</b>
            </p>
          </div>}
        </Card>
      )}
    </div>
  );
}
function EmptyActivities({ go }: { go: (screen: Screen) => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
      <Stamp className="mx-auto text-slate-300" size={38} />
      <h2 className="mt-3 font-bold text-slate-700">まだ活動記録はありません</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        ボランティアに参加してスタンプが付与されると、ここに記録が表示されます。
      </p>
      <div className="mt-4">
        <Btn style="line" onClick={() => go("home")}>ホームへ戻る</Btn>
      </div>
    </div>
  );
}

function Stamps({ go, records }: any) {
  const [filter, setFilter] = useState("すべて");
  return (
    <div className="space-y-6">
      <div>
        <p className="font-bold text-orange-600">MY STAMP COLLECTION</p>
        <h1 className="text-2xl font-black">スタンプ帳</h1>
      </div>
      <Card title="スタンプを探す">
        <div className="flex flex-wrap gap-2">
          {["すべて", "今年度", "スポーツ", "防災", "救護", "獲得済みのみ"].map(
            (x) => (
              <button
                key={x}
                onClick={() => setFilter(x)}
                className={`rounded-full px-4 py-2 text-sm font-bold ${filter === x ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600"}`}
              >
                {x}
              </button>
            ),
          )}
        </div>
      </Card>
      {records.length === 0 ? <EmptyActivities go={go} /> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {records.map((r: Record, i: number) => (
          <article
            key={r.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex justify-between">
              <Seal code={r.code} i={i} large />
              <Tag>獲得済み</Tag>
            </div>
            <h2 className="mt-5 font-bold">{r.title}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {r.date}
              <br />
              {r.location}
              <br />
              活動 {r.hours}時間 /{" "}
              <b className="text-orange-600">+{r.points}pt</b>
            </p>
            <div className="mt-4">
              <Btn style="line" onClick={() => go("event")}>
                詳細を見る
              </Btn>
            </div>
          </article>
        ))}
      </div>}
    </div>
  );
}
function History({ go, records, setSelectedRecordId }: any) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("すべて");
  const list = records.filter(
    (r: Record) =>
      r.title.includes(text) &&
      (category === "すべて" || r.category === category),
  );
  return (
    <div className="space-y-6">
      <div>
        <p className="font-bold text-orange-600">ACTIVITY LOG</p>
        <h1 className="text-2xl font-black">活動履歴</h1>
      </div>
      <Card title="検索・絞り込み">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="relative md:col-span-2">
            <Search
              className="absolute left-3 top-3 text-slate-400"
              size={18}
            />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="ボランティア名で検索"
              className="w-full rounded-xl border py-3 pl-10"
            />
          </label>
          <select className="rounded-xl border p-3 text-sm">
            <option>2026年度</option>
            <option>2025年度</option>
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border p-3 text-sm"
          >
            <option>すべて</option>
            <option>救護</option>
            <option>防災</option>
            <option>スポーツ</option>
            <option>地域活動</option>
          </select>
        </div>
      </Card>
      <Card title="参加したボランティア">
        {list.length === 0 ? <EmptyActivities go={go} /> : list.map((r: Record, i: number) => (
          <div
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 py-4 last:border-0"
          >
            <div className="flex items-center gap-3">
              <Seal code={r.code} i={i} />
              <span>
                <b className="block">{r.title}</b>
                <small className="text-slate-500">
                  {r.date} / {r.location} / {r.hours}時間 / {r.points}pt
                </small>
              </span>
            </div>
            <span className="flex items-center gap-2">
              <small className="font-bold text-slate-500">メモ: {r.memo}</small>
              <Btn style="plain" onClick={() => {
                setSelectedRecordId(r.id);
                go("event");
              }}>
                共有メモを入力
              </Btn>
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}
function Event({ record, go, setRecords, note, profile }: any) {
  const [edit, setEdit] = useState(false);
  const [memoText, setMemoText] = useState("");
  const [memoStatus, setMemoStatus] = useState("未入力");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    void supabase?.from("activity_memos")
      .select("free_memo, visibility")
      .eq("participation_id", record.id)
      .maybeSingle()
      .then(({ data }) => {
        if (active && data) {
          setMemoText(data.free_memo ?? "");
          setMemoStatus(data.visibility === "public" ? "公開中" : data.visibility === "pending" ? "公開確認中" : "下書き");
        }
      });
    return () => { active = false; };
  }, [record.id]);

  const save = async () => {
    if (!memoText.trim() || !supabase) return;
    setSaving(true);
    const { error } = await supabase.from("activity_memos").upsert(
      {
        participation_id: record.id,
        user_id: profile.id,
        free_memo: memoText.trim(),
        visibility: "pending",
      },
      { onConflict: "participation_id" },
    );
    setSaving(false);
    if (error) {
      note("共有メモを保存できませんでした");
      return;
    }
    setRecords((all: Record[]) =>
      all.map((x) =>
        x.id === record.id
          ? {
              ...x,
              memo: "公開確認中",
            }
          : x,
      ),
    );
    setMemoStatus("公開確認中");
    setEdit(false);
    note("共有メモの公開申請を送信しました");
  };
  return (
    <div className="space-y-6">
      <button
        onClick={() => go("history")}
        className="text-sm font-bold text-slate-500"
      >
        ← 活動履歴へ戻る
      </button>
      <Card title={record.title}>
        <div className="flex flex-col gap-5 sm:flex-row">
          <Seal code={record.code} large />
          <div>
            <p className="font-bold text-orange-600">{record.category}</p>
            <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <p>開催日: {record.date}</p>
              <p>場所: {record.location}</p>
              <p>主催者: 東洋医療専門学校 地域連携室</p>
              <p>活動時間: {record.hours}時間</p>
              <p className="font-bold text-orange-600">
                獲得ポイント: {record.points}pt
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-4 border-t pt-5 md:grid-cols-2">
          <p className="text-sm leading-7">
            <b>活動内容</b>
            <br />
            参加者の案内と救護ブースの補助を担当しました。教職員の指示に従って活動します。
          </p>
          <p className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            <b>管理者からの注意事項</b>
            <br />
            体調が優れない場合は無理をせず、担当教職員へすぐに連絡してください。
          </p>
        </div>
      </Card>
      <Card
        title="共有メモ"
        action={
          <Btn style="line" onClick={() => setEdit(!edit)}>
            <NotebookPen size={16} />
            {edit ? "閉じる" : "メモを入力"}
          </Btn>
        }
      >
        {edit ? (
          <div className="space-y-3">
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
              活動内容や注意事項など、後輩に役立つ内容を自由に記入してください。個人を特定できる情報は入力しないでください。
            </p>
            <textarea
              value={memoText}
              onChange={(e) => setMemoText(e.target.value)}
              placeholder="例: 集合場所、担当した内容、持ち物、注意した点など"
              className="min-h-28 w-full rounded-xl border p-3 text-sm"
            />
            <br />
            <Btn disabled={saving || !memoText.trim()} onClick={save}>
              {saving ? "送信中..." : "共有メモを公開申請する"}
            </Btn>
          </div>
        ) : (
          <p className="rounded-xl bg-slate-50 p-4 text-sm">
            {memoText || "まだ共有メモはありません。"} <Tag>{memoStatus}</Tag>
          </p>
        )}
      </Card>
    </div>
  );
}

function SharedMemos() {
  const [memos, setMemos] = useState<any[]>([]);
  const [year, setYear] = useState("all");
  const [yearOrder, setYearOrder] = useState("newest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void supabase?.from("activity_memos")
      .select("id, free_memo, created_at, participations(volunteer_events(title, event_date, category))")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (active) {
          setMemos(data ?? []);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, []);

  const eventFor = (memo: any) => {
    const participation = Array.isArray(memo.participations) ? memo.participations[0] : memo.participations;
    return Array.isArray(participation?.volunteer_events) ? participation.volunteer_events[0] : participation?.volunteer_events;
  };
  const years = [...new Set(memos.map((memo) => String(eventFor(memo)?.event_date ?? "").slice(0, 4)).filter(Boolean))].sort().reverse();
  const visibleMemos = memos
    .filter((memo) => year === "all" || String(eventFor(memo)?.event_date ?? "").startsWith(year))
    .sort((left, right) => {
      const comparison = String(eventFor(left)?.event_date ?? "").localeCompare(String(eventFor(right)?.event_date ?? ""));
      return yearOrder === "newest" ? -comparison : comparison;
    });
  const groups: { [title: string]: { event: any; memos: any[] } } = {};
  visibleMemos.forEach((memo) => {
    const event = eventFor(memo);
    const title = event?.title ?? "活動名未設定";
    (groups[title] ??= { event, memos: [] }).memos.push(memo);
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="font-bold text-orange-600">SHARED MEMOS</p>
        <h1 className="text-2xl font-black">共有メモ</h1>
        <p className="mt-2 text-sm text-slate-500">先輩が公開した活動の工夫や注意点を確認できます。</p>
      </div>
      <Card title="年度で絞り込む・並べ替える">
        <div className="flex flex-wrap gap-3">
          <select value={year} onChange={(event) => setYear(event.target.value)} className="rounded-xl border p-3 text-sm">
            <option value="all">すべての年度</option>
            {years.map((value) => <option key={value} value={value}>{value}年度</option>)}
          </select>
          <select value={yearOrder} onChange={(event) => setYearOrder(event.target.value)} className="rounded-xl border p-3 text-sm">
            <option value="newest">新しい年度順</option>
            <option value="oldest">古い年度順</option>
          </select>
        </div>
      </Card>
      {loading ? <p className="text-sm text-slate-500">共有メモを読み込んでいます...</p> : Object.keys(groups).length === 0 ? <p className="rounded-xl bg-white p-5 text-sm text-slate-500">この年度に公開済みの共有メモはありません。</p> : Object.entries(groups).map(([title, group]) => (
        <Card key={title} title={title}>
          <p className="mb-4 text-sm text-slate-500">{group.event?.event_date} / {group.event?.category}</p>
          <div className="space-y-3">
            {group.memos.map((memo) => <p key={memo.id} className="rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">{memo.free_memo}</p>)}
          </div>
        </Card>
      ))}
    </div>
  );
}
function Ranking({ visible, hasActivities }: { visible: boolean; hasActivities: boolean }) {
  const [tab, setTab] = useState("月間");
  if (!visible)
    return (
      <div className="grid min-h-96 place-items-center text-center">
        <div>
          <Trophy className="mx-auto text-slate-300" size={50} />
          <h1 className="mt-4 text-xl font-bold">
            現在、ランキングは公開されていません
          </h1>
        </div>
      </div>
    );
  if (!hasActivities)
    return (
      <div className="grid min-h-96 place-items-center text-center">
        <div>
          <Trophy className="mx-auto text-slate-300" size={50} />
          <h1 className="mt-4 text-xl font-bold">活動実績がまだありません</h1>
          <p className="mt-2 text-sm text-slate-500">スタンプを獲得するとランキングに参加できます。</p>
        </div>
      </div>
    );
  return (
    <div className="space-y-6">
      <div>
        <p className="font-bold text-orange-600">LEADERBOARD</p>
        <h1 className="text-2xl font-black">ランキング</h1>
      </div>
      <div className="flex rounded-xl bg-slate-200 p-1">
        {["月間", "年間", "累計"].map((x) => (
          <button
            key={x}
            onClick={() => setTab(x)}
            className={`flex-1 rounded-lg py-2 text-sm font-bold ${tab === x ? "bg-white text-orange-600 shadow" : "text-slate-500"}`}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {students.slice(0, 3).map((s, i) => (
          <article
            key={s.number}
            className={`rounded-2xl border p-5 ${["border-amber-300 bg-amber-50", "border-slate-300 bg-slate-50", "border-orange-300 bg-orange-50"][i]}`}
          >
            <Medal
              className={
                ["text-amber-500", "text-slate-400", "text-orange-500"][i]
              }
              size={27}
            />
            <b className="mt-4 block text-2xl">{i + 1}位</b>
            <h2 className="mt-2 font-black">{s.name}</h2>
            <p className="text-sm text-slate-600">
              {s.stamps} スタンプ / {s.points}pt
            </p>
          </article>
        ))}
      </div>
      <Card title={`${tab}ランキング`}>
        {students.map((s, i) => (
          <div
            key={s.number}
            className={`grid grid-cols-[2rem_1fr_auto] items-center gap-3 border-b p-3 text-sm last:border-0 ${s.name === "田中 一平" ? "rounded-xl border-2 border-orange-400 bg-orange-50" : ""}`}
          >
            <b>{i + 1}</b>
            <span>
              <b>{s.name}</b>
              {s.name === "田中 一平" && (
                <small className="ml-2 text-orange-600">あなた</small>
              )}
            </span>
            <span>
              <b>{s.stamps}</b>個{" "}
              <small className="block text-slate-500">
                {s.points}pt / {s.hours}時間
              </small>
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}
function Profile({ note, profile, records }: any) {
  const [nickname, setNickname] = useState(profile.nickname ?? "");
  const [display, setDisplay] = useState("ニックネーム");
  const stampCount = records.length;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="font-bold text-orange-600">MY PAGE</p>
        <h1 className="text-2xl font-black">マイページ</h1>
      </div>
      <Card title="アカウント情報">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold">
            氏名
            <input
              disabled
              value={profile.name}
              className="mt-1 w-full rounded-xl border bg-slate-100 p-3 text-slate-500"
            />
          </label>
          <label className="text-sm font-bold">
            学籍番号
            <input
              disabled
              value={profile.student_number ?? ""}
              className="mt-1 w-full rounded-xl border bg-slate-100 p-3 text-slate-500"
            />
          </label>
          <label className="text-sm font-bold">
            ニックネーム
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="mt-1 w-full rounded-xl border p-3"
            />
          </label>
          <label className="text-sm font-bold">
            ランキング表示設定
            <select
              value={display}
              onChange={(e) => setDisplay(e.target.value)}
              className="mt-1 w-full rounded-xl border p-3"
            >
              <option>氏名</option>
              <option>ニックネーム</option>
              <option>匿名</option>
              <option>ランキングに参加しない</option>
            </select>
          </label>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          氏名・学籍番号の修正が必要な場合は、管理者へお問い合わせください。
        </p>
        <div className="mt-4">
          <Btn onClick={() => note("プロフィールを保存しました")}>保存する</Btn>
        </div>
      </Card>
      <Card title="通知とセキュリティ">
        <label className="flex justify-between text-sm font-bold">
          お知らせの通知を受け取る
          <input
            type="checkbox"
            defaultChecked
            className="size-5 accent-orange-500"
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          <Btn
            style="line"
            onClick={() => note("パスワード変更画面を準備しました")}
          >
            パスワードを変更する
          </Btn>
          <Btn style="plain" onClick={() => note("利用規約を表示しました")}>
            利用規約
          </Btn>
        </div>
      </Card>
      <Card title="獲得バッジ">
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            ["BRONZE", "ブロンズ", 5],
            ["SILVER", "シルバー", 10],
            ["GOLD", "ゴールド", 20],
            ["MASTER", "TMCマスター", 30],
          ].map(([code, name, requirement], i) => (
            <div
              key={name as string}
              className={`rounded-xl border p-3 ${stampCount >= Number(requirement) ? "border-orange-200 bg-orange-50" : "opacity-60"}`}
            >
              <Seal code={code as string} i={i} />
              <b className="mt-2 block text-xs">{name as string}</b>
              <small>{stampCount >= Number(requirement) ? "獲得済み" : `${requirement}個で獲得`}</small>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Admin({
  screen,
  go,
  note,
  ranking,
  setRanking,
  chosen,
  setChosen,
  setDialog,
  profile,
}: any) {
  const active = adminMenu.find((x) => x.id === screen) || adminMenu[0];
  const body =
    screen === "dashboard" ? (
      <Dashboard go={go} />
    ) : screen === "events" ? (
      <Events note={note} />
    ) : screen === "stampAdmin" ? (
      <StampAdmin note={note} />
    ) : screen === "award" ? (
      <AwardStudents
        chosen={chosen}
        setChosen={setChosen}
        setDialog={setDialog}
      />
    ) : screen === "users" ? (
      <UserAdmin note={note} setDialog={setDialog} />
    ) : screen === "memos" ? (
      <Memos note={note} profile={profile} />
    ) : screen === "settings" ? (
      <RankingSettings ranking={ranking} setRanking={setRanking} note={note} />
    ) : screen === "awards" ? (
      <Awards note={note} />
    ) : (
      <Logs />
    );
  return (
    <div className="grid gap-6 lg:grid-cols-[15rem_1fr]">
      <aside className="hidden rounded-2xl border bg-white p-3 shadow-sm lg:block">
        <p className="px-3 py-3 text-xs font-bold tracking-widest text-slate-400">
          管理メニュー
        </p>
        {adminMenu.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => go(id)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold ${screen === id ? "bg-orange-50 text-orange-600" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </aside>
      <div>
        <div className="mb-5 flex justify-between">
          <div>
            <p className="font-bold text-orange-600">ADMIN CONSOLE</p>
            <h1 className="text-2xl font-black">{active.label}</h1>
          </div>
          <select
            value={screen}
            onChange={(e) => go(e.target.value as Screen)}
            className="rounded-xl border bg-white p-2 text-sm lg:hidden"
          >
            {adminMenu.map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
          </select>
        </div>
        {body}
      </div>
    </div>
  );
}
function Dashboard({ go }: { go: (screen: Screen) => void }) {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    void getAdminDashboardData()
      .then((nextData) => {
        if (active) setData(nextData);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const stats = [
    ["登録学生数", data?.studentCount, Users],
    ["今月の参加学生", data?.monthlyStudentCount, Heart],
    ["今月の延べ参加", data?.monthlyParticipationCount, CalendarDays],
    ["付与スタンプ", data?.monthlyParticipationCount, Stamp],
    ["未確認の登録", data?.unverifiedCount, ShieldCheck],
    ["確認待ちメモ", data?.pendingMemoCount, NotebookPen],
  ];
  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-xl bg-amber-50 p-4 text-sm font-bold text-amber-800">
          管理データを取得できませんでした。権限と Supabase の接続設定を確認してください。
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        {stats.map(([label, num, Icon]: any) => (
          <div
            key={label}
            className="rounded-2xl border bg-white p-4 shadow-sm"
          >
            <Icon className="text-orange-500" size={20} />
            <p className="mt-3 text-xs font-bold text-slate-500">{label}</p>
            <b className="text-2xl">{data ? num : "-"}</b>
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="今月の参加状況">
          <p className="text-sm leading-7 text-slate-600">
            {data
              ? `参加学生 ${data.monthlyStudentCount}名、延べ参加 ${data.monthlyParticipationCount}件です。`
              : "参加状況を読み込んでいます..."}
          </p>
        </Card>
        <Card
          title="開催予定のボランティア"
          action={
            <Btn style="plain" onClick={() => go("events")}>
              管理する
            </Btn>
          }
        >
          <div className="space-y-3">
            {data?.upcomingEvents.length ? data.upcomingEvents.map((event) => (
                <p
                  key={event.id}
                  className="flex justify-between rounded-xl bg-slate-50 p-3 text-sm"
                >
                  <b>{event.title}</b>
                  <Tag>{new Intl.DateTimeFormat("ja-JP", { month: "long", day: "numeric" }).format(new Date(`${event.event_date}T00:00:00+09:00`))}</Tag>
                </p>
              )) : <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">開催予定のボランティアはありません。</p>}
          </div>
        </Card>
      </div>
      <Card title="最近の管理操作">
        <div className="space-y-3 text-sm">
          {data?.recentLogs.length ? data.recentLogs.map((log) => (
            <p key={log.id} className="border-l-2 border-orange-400 pl-3">
              {log.action}
            </p>
          )) : <p className="border-l-2 border-slate-300 pl-3 text-slate-500">最近の管理操作はありません。</p>}
        </div>
      </Card>
    </div>
  );
}
function Events({ note }: any) {
  const [items, setItems] = useState(activity.map((x) => x.title));
  return (
    <div className="space-y-5">
      <div className="flex justify-between">
        <input
          placeholder="イベント名で検索"
          className="rounded-xl border px-3 py-2 text-sm"
        />
        <Btn
          onClick={() => {
            setItems([...items, "新規ボランティアイベント"]);
            note("イベントを作成しました");
          }}
        >
          <Plus size={16} />
          新規作成
        </Btn>
      </div>
      <Card title="ボランティアイベント一覧">
        {items.map((x, i) => (
          <div
            key={x}
            className="flex flex-wrap justify-between gap-3 border-b py-4 text-sm last:border-0"
          >
            <span>
              <b>{x}</b>
              <small className="ml-2 text-slate-500">
                2026年7月{12 + i}日 / {i % 2 ? "防災" : "救護"} / 公開中
              </small>
            </span>
            <span className="flex gap-2">
              <Btn
                style="line"
                onClick={() => note("イベント編集画面を開きました")}
              >
                編集
              </Btn>
              <Btn
                style="plain"
                onClick={() => {
                  setItems([...items, `${x}（複製）`]);
                  note("イベントを複製しました");
                }}
              >
                複製
              </Btn>
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}
function StampAdmin({ note }: any) {
  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Btn onClick={() => note("スタンプ作成フォームを開きました")}>
          <Plus size={16} />
          新規スタンプ
        </Btn>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {activity.map((x, i) => (
          <Card key={x.id} title={x.title}>
            <div className="flex gap-4">
              <Seal code={x.code} i={i} large />
              <p className="text-sm text-slate-500">
                丸型・破線
                <br />
                2026年度
                <br />
                <button
                  onClick={() => note("スタンプを複製しました")}
                  className="mt-2 font-bold text-orange-600"
                >
                  複製
                </button>
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
function AwardStudents({ chosen, setChosen, setDialog }: any) {
  const [text, setText] = useState("");
  const list = students.filter(
    (s) => s.name.includes(text) || s.number.includes(text),
  );
  const toggle = (number: string) =>
    setChosen((old: string[]) =>
      old.includes(number) ? old.filter((x) => x !== number) : [...old, number],
    );
  return (
    <div className="space-y-5">
      <Card title="1. ボランティアイベントを選択">
        <select className="w-full rounded-xl border p-3">
          <option>明石国際アクアスロン（5時間 / 20pt）</option>
          <option>地域防災訓練（3時間 / 15pt）</option>
        </select>
      </Card>
      <Card
        title="2. 参加学生を選択"
        action={
          <b className="text-sm text-orange-600">{chosen.length}名を選択中</b>
        }
      >
        <label className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="氏名・学籍番号で検索"
            className="w-full rounded-xl border py-3 pl-10"
          />
        </label>
        <div className="mt-4 divide-y">
          {list.map((s) => (
            <label key={s.number} className="flex justify-between py-3 text-sm">
              <span>
                <b>{s.name}</b>
                <small className="ml-2 text-slate-500">
                  {s.number} / 確認済み
                </small>
              </span>
              <input
                type="checkbox"
                checked={chosen.includes(s.number)}
                onChange={() => toggle(s.number)}
                className="size-5 accent-orange-500"
              />
            </label>
          ))}
        </div>
      </Card>
      <Btn disabled={!chosen.length} onClick={() => setDialog("award")}>
        <Sparkles size={17} />
        {chosen.length}名へ一括付与する
      </Btn>
    </div>
  );
}
function UserAdmin({ note, setDialog }: any) {
  return (
    <div className="space-y-5">
      <Card title="学生を検索">
        <div className="flex flex-wrap gap-3">
          <input
            placeholder="氏名・学籍番号"
            className="rounded-xl border p-3 text-sm"
          />
          <select className="rounded-xl border p-3 text-sm">
            <option>すべて</option>
            <option>未確認</option>
            <option>確認済み</option>
          </select>
          <Btn style="line" onClick={() => setDialog("delete")}>
            未確認を一括削除
          </Btn>
        </div>
      </Card>
      <Card title="新規登録者・学生一覧">
        {students.map((s, i) => (
          <div
            key={s.number}
            className="flex flex-wrap justify-between gap-3 border-b py-3 text-sm last:border-0"
          >
            <span>
              <b>{s.name}</b>
              <small className="ml-2 text-slate-500">{s.number}</small>
            </span>
            <span className="flex gap-2">
              <Tag>{i < 3 ? "未確認" : "確認済み"}</Tag>
              <Btn style="plain" onClick={() => note("学生情報を確認しました")}>
                確認
              </Btn>
              <Btn style="plain" onClick={() => setDialog("stop")}>
                停止
              </Btn>
              <Btn
                style="plain"
                onClick={() => note("一時パスワード: TMC-7A9K（1回のみ有効）")}
              >
                リセット
              </Btn>
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}
function Memos({ note, profile }: { note: (text: string) => void; profile: UserProfile }) {
  const [memos, setMemos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void supabase?.from("activity_memos")
      .select("id, free_memo, participations(volunteer_events(title), users(name, student_number))")
      .eq("visibility", "pending")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (active) {
          setMemos(data ?? []);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, []);

  const approve = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from("activity_memos").update({
      visibility: "public",
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) {
      note("メモを公開できませんでした");
      return;
    }
    setMemos((current) => current.filter((memo) => memo.id !== id));
    note("メモを公開承認しました");
  };

  return (
    <Card title="公開確認待ちメモ">
      <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
        確認項目: 個人情報が含まれない / 不適切な表現がない /
        後輩に役立つ内容である
      </p>
      <div className="mt-4 space-y-4">
        {loading ? <p className="text-sm text-slate-500">共有メモを読み込んでいます...</p> : memos.length === 0 ? <p className="text-sm text-slate-500">公開確認待ちのメモはありません。</p> : memos.map((memo) => {
          const participation = Array.isArray(memo.participations) ? memo.participations[0] : memo.participations;
          const student = Array.isArray(participation?.users) ? participation.users[0] : participation?.users;
          const event = Array.isArray(participation?.volunteer_events) ? participation.volunteer_events[0] : participation?.volunteer_events;
          return <article key={memo.id} className="rounded-xl border p-4">
            <div className="flex justify-between gap-3">
              <span>
                <b>{student?.name} / {student?.student_number}</b>
                <small className="ml-2 text-slate-500">{event?.title}</small>
              </span>
              <Tag>公開確認中</Tag>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{memo.free_memo}</p>
            <div className="mt-3 flex gap-2">
              <Btn onClick={() => approve(memo.id)}>
                公開承認
              </Btn>
              <Btn
                style="line"
                onClick={() => note("差し戻しコメントを送信しました")}
              >
                差し戻し
              </Btn>
              <Btn
                style="plain"
                onClick={() => note("役立つメモとして固定しました")}
              >
                固定
              </Btn>
            </div>
          </article>;
        })}
      </div>
    </Card>
  );
}
function RankingSettings({ ranking, setRanking, note }: any) {
  const [set, setSet] = useState({
    monthly: true,
    yearly: true,
    total: true,
    anonymous: true,
    optout: true,
  });
  return (
    <Card title="ランキング公開設定">
      <label className="flex justify-between border-b py-4 text-sm font-bold">
        ランキング全体を公開
        <input
          type="checkbox"
          checked={ranking}
          onChange={(e) => setRanking(e.target.checked)}
          className="size-5 accent-orange-500"
        />
      </label>
      {Object.entries({
        monthly: "月間ランキングを公開",
        yearly: "年間ランキングを公開",
        total: "累計ランキングを公開",
        anonymous: "匿名表示を許可",
        optout: "学生のランキング不参加を許可",
      }).map(([key, label]) => (
        <label
          key={key}
          className="flex justify-between border-b py-4 text-sm font-bold"
        >
          {label}
          <input
            type="checkbox"
            checked={set[key as keyof typeof set]}
            onChange={(e) => setSet({ ...set, [key]: e.target.checked })}
            className="size-5 accent-orange-500"
          />
        </label>
      ))}
      <label className="mt-4 block text-sm font-bold">
        上位表示人数
        <select className="mt-2 block rounded-xl border p-3">
          <option>20名</option>
          <option>10名</option>
        </select>
      </label>
      <div className="mt-5">
        <Btn
          onClick={() => note("ランキング設定を保存し、学生画面へ反映しました")}
        >
          設定を保存する
        </Btn>
      </div>
    </Card>
  );
}
function Awards({ note }: any) {
  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Btn onClick={() => note("表彰条件の作成フォームを開きました")}>
          <Plus size={16} />
          表彰条件を追加
        </Btn>
      </div>
      <Card title="表彰対象者一覧">
        <div className="overflow-x-auto">
          <table className="w-full min-w-150 text-left text-sm">
            <thead>
              <tr className="border-b text-xs text-slate-500">
                <th className="p-3">学生名</th>
                <th>学籍番号</th>
                <th>スタンプ</th>
                <th>ポイント</th>
                <th>表彰名</th>
                <th>受取状況</th>
              </tr>
            </thead>
            <tbody>
              {students.slice(0, 6).map((s, i) => (
                <tr key={s.number} className="border-b">
                  <td className="p-3 font-bold">{s.name}</td>
                  <td>{s.number}</td>
                  <td>{s.stamps}</td>
                  <td>{s.points}</td>
                  <td>
                    {i < 3 ? "シルバーボランティア" : "ブロンズボランティア"}
                  </td>
                  <td>
                    <Tag>{i === 0 ? "受取済み" : "未受取"}</Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
function Logs() {
  return (
    <Card title="操作履歴">
      {[
        "2026/07/20 10:20 管理者が田中 一平へスタンプを付与",
        "2026/07/19 14:05 管理者が活動メモを公開承認",
        "2026/07/18 09:30 管理者が地域防災訓練を更新",
        "2026/07/17 16:15 管理者が学生アカウントを確認",
      ].map((x) => (
        <p
          key={x}
          className="border-l-2 border-slate-300 py-2 pl-3 text-sm text-slate-600"
        >
          {x}
        </p>
      ))}
    </Card>
  );
}
function Dialog({
  kind,
  close,
  confirm,
}: {
  kind: string;
  close: () => void;
  confirm: () => void;
}) {
  const text =
    kind === "award"
      ? "スタンプを付与しますか？"
      : kind === "stop"
        ? "アカウントを停止しますか？"
        : "未確認アカウントを一括削除しますか？";
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex justify-between">
          <h2 className="text-lg font-black">確認</h2>
          <button onClick={close} aria-label="閉じる">
            <X />
          </button>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          {text}
          <br />
          この操作は操作履歴に記録されます。
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Btn style="line" onClick={close}>
            キャンセル
          </Btn>
          <Btn style={kind === "award" ? "main" : "danger"} onClick={confirm}>
            実行する
          </Btn>
        </div>
      </div>
    </div>
  );
}
