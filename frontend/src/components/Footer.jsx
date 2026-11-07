import React from "react";
import { BookOpen } from "lucide-react";
export default function Footer() {
  return <footer className="site-footer"><span><BookOpen size={15} /> Readers Paradise</span><span>A good book is a journey you can return to.</span><small>© {new Date().getFullYear()} Readers Paradise</small></footer>;
}
