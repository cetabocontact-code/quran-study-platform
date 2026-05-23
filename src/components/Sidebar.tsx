"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Compass, Search, Activity, Book, Menu, X } from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "الرئيسية", href: "/", icon: BookOpen },
  { name: "محرك الجذور", href: "/root-explorer", icon: Search },
  { name: "الإحالة الذاتية", href: "/self-reference", icon: Activity },
  { name: "وضع الاكتشاف", href: "/discovery", icon: Compass },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-zinc-900 border border-zinc-800 rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5 text-zinc-400" /> : <Menu className="w-5 h-5 text-zinc-400" />}
      </button>

      <div className={`fixed inset-y-0 right-0 z-40 w-64 bg-zinc-950 border-l border-zinc-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-center h-20 border-b border-zinc-800 px-6">
          <Link href="/" className="flex items-center gap-3">
            <Book className="w-6 h-6 text-teal-500" />
            <span className="text-xl font-bold tracking-tight text-zinc-100">بصيرة</span>
          </Link>
        </div>
        
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-teal-900/20 text-teal-400 border border-teal-900/50" 
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
