import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";

import { Wordmark } from "../components/brand";
import { IconArrowRight, IconEye } from "../components/icons";

/** /login as login.jpg, for the video and screenshots. There is no auth behind it: Sign in goes to the dashboard. */
export function Login() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="flex h-full min-h-[640px] bg-midnight">
      <section className="relative hidden flex-[1.6] overflow-hidden md:block">
        <img src="/img/venue.jpg" alt="" className="absolute inset-0 h-full w-full scale-[1.02] object-cover object-[70%_center]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(15_31_29/0.92)_0%,rgb(15_31_29/0.7)_38%,rgb(15_31_29/0.15)_75%,transparent_100%)]" />
        <div className="relative flex h-full flex-col justify-center px-[9%] text-ivory">
          <Wordmark tone="dark" className="text-[clamp(88px,10vw,156px)]" />
          <p className="mt-6 font-serif text-[clamp(36px,3.6vw,58px)] leading-tight">Hospitality, uninterrupted.</p>
          <p className="mt-3 text-[clamp(18px,1.6vw,26px)] text-ivory/90">Smarter payments. Seamless experiences.</p>
        </div>
      </section>

      <section className="flex flex-1 items-center bg-[#f5f2eb] px-[6%]">
        <form onSubmit={submit} className="w-full max-w-[400px]" autoComplete="off">
          <Wordmark className="text-[60px]" />
          <h1 className="mt-14 font-serif text-[40px] leading-tight text-midnight">Welcome back</h1>
          <p className="mt-1 text-[18px] text-muted">Sign in to your workspace</p>

          <label className="mt-12 block text-[15px] font-medium text-midnight" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@yourcompany.com"
            className="mt-2 h-[52px] w-full rounded-lg border border-stone bg-paper px-4 text-[15px] text-midnight outline-none placeholder:text-muted/80 focus:border-eucalyptus"
          />

          <label className="mt-7 block text-[15px] font-medium text-midnight" htmlFor="password">
            Password
          </label>
          <div className="relative mt-2">
            <input
              id="password"
              type={show ? "text" : "password"}
              placeholder="Enter your password"
              className="h-[52px] w-full rounded-lg border border-stone bg-paper pr-12 pl-4 text-[15px] text-midnight outline-none placeholder:text-muted/80 focus:border-eucalyptus"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-graphite"
              aria-label={show ? "Hide password" : "Show password"}
            >
              <IconEye size={20} />
            </button>
          </div>

          <button type="submit" className="relative mt-7 flex h-[52px] w-full items-center justify-center rounded-lg bg-midnight text-[16px] font-medium text-ivory hover:bg-[#1b302d]">
            Sign in
            <IconArrowRight size={20} className="absolute right-5" />
          </button>
        </form>
      </section>
    </div>
  );
}
