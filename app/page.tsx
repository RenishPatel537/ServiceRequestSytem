import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
      <h1 className="text-2xl font-bold">Service Request System</h1>
      <p>Please select your dashboard:</p>
      <div className="flex space-x-4">
        <Link href="/requestor/dashboard" className="text-blue-600 hover:underline">Requestors</Link>
        <Link href="/admin/dashboard" className="text-blue-600 hover:underline">Admins</Link>
      </div>
    </div>
  );
}
