import { SignUp } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shield, User, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/sign-up/$")({
  component: Page,
});

function Page() {
  const [role, setRole] = useState<string | null>(null);

  if (!role) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div 
          className="w-full max-w-md p-8 rounded-2xl"
          style={{
            background: 'var(--color-surface-raised)',
            boxShadow: 'var(--nm-raised-lg)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Create your account</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>How will you be using RakshaTrack?</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => setRole('student')}
              className="w-full flex items-center p-4 rounded-xl transition-all group border border-transparent"
              style={{ background: 'var(--color-surface-sunken)', boxShadow: 'var(--nm-inset)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent-500)'; (e.currentTarget as HTMLElement).style.background = 'oklch(0.63 0.188 155 / 0.05)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-sunken)' }}
            >
              <div 
                className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full group-hover:scale-110 transition-transform"
                style={{ background: 'oklch(0.63 0.188 155 / 0.12)', color: 'var(--color-accent-500)' }}
              >
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="ml-4 text-left">
                <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Student</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Track your transport and view your passes</p>
              </div>
            </button>

            <button
              onClick={() => setRole('guardian')}
              className="w-full flex items-center p-4 rounded-xl transition-all group border border-transparent"
              style={{ background: 'var(--color-surface-sunken)', boxShadow: 'var(--nm-inset)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'oklch(0.65 0.17 290)'; (e.currentTarget as HTMLElement).style.background = 'oklch(0.65 0.17 290 / 0.05)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-sunken)' }}
            >
              <div 
                className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full group-hover:scale-110 transition-transform"
                style={{ background: 'oklch(0.65 0.17 290 / 0.12)', color: 'oklch(0.45 0.17 290)' }}
              >
                <User className="w-6 h-6" />
              </div>
              <div className="ml-4 text-left">
                <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Guardian</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Monitor your ward's safety and transit status</p>
              </div>
            </button>

            <button
              onClick={() => setRole('admin')}
              className="w-full flex items-center p-4 rounded-xl transition-all group border border-transparent"
              style={{ background: 'var(--color-surface-sunken)', boxShadow: 'var(--nm-inset)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'oklch(0.72 0.18 55)'; (e.currentTarget as HTMLElement).style.background = 'oklch(0.72 0.18 55 / 0.05)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-sunken)' }}
            >
              <div 
                className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full group-hover:scale-110 transition-transform"
                style={{ background: 'oklch(0.72 0.18 55 / 0.12)', color: 'oklch(0.52 0.18 55)' }}
              >
                <Shield className="w-6 h-6" />
              </div>
              <div className="ml-4 text-left">
                <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Administrator</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Manage fleet operations and verification</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mb-6 self-center">
        <button 
          onClick={() => setRole(null)}
          className="text-sm font-semibold hover:underline transition-colors duration-200"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--color-accent-500)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)' }}
        >
          ← Change Role
        </button>
      </div>
      <SignUp unsafeMetadata={{ role }} />
    </div>
  );
}
