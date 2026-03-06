'use client';

import { useState } from "react";
import svgPaths from "./svg-t3rwygkbpy";

// ── MCP Server tab types & data ──────────────────────────────────────────────

type MainTab = "interactive" | "claude" | "cursor" | "vscode" | "codex" | "opencode";
type InstallMethod = "one-liner" | "npm";

const CLIENT_TABS = ["claude", "cursor", "vscode", "codex", "opencode"] as const;
type Client = (typeof CLIENT_TABS)[number];

const CLIENT_LABELS: Record<Client, string> = {
  claude: "Claude",
  cursor: "Cursor",
  vscode: "VScode",
  codex: "Codex",
  opencode: "Opencode",
};

const ONE_LINER_COMMANDS: Record<MainTab, string> = {
  interactive: "$ npx @orderly.network/mcp-server init",
  claude: "$ npx @orderly.network/mcp-server init --client claude",
  cursor: "$ npx @orderly.network/mcp-server init --client cursor",
  vscode: "$ npx @orderly.network/mcp-server init --client vscode",
  codex: "$ npx @orderly.network/mcp-server init --client codex",
  opencode: "$ npx @orderly.network/mcp-server init --client opencode",
};

const NPM_COMMANDS: Record<Client, string> = {
  claude: "$ npm install -g @orderly.network/mcp-server && mcp-server init --client claude",
  cursor: "$ npm install -g @orderly.network/mcp-server && mcp-server init --client cursor",
  vscode: "$ npm install -g @orderly.network/mcp-server && mcp-server init --client vscode",
  codex: "$ npm install -g @orderly.network/mcp-server && mcp-server init --client codex",
  opencode: "$ npm install -g @orderly.network/mcp-server && mcp-server init --client opencode",
};

// ── Shared ───────────────────────────────────────────────────────────────────

function CopyIcon() {
  return (
    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
      <g id="content_copy">
        <mask height="24" id="mask0_group_copy" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
          <rect fill="#D9D9D9" height="24" id="Bounding box" width="24" />
        </mask>
        <g mask="url(#mask0_group_copy)">
          <path d={svgPaths.p22f3db00} fill="white" id="content_copy_2" />
        </g>
      </g>
    </svg>
  );
}

function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
    document.body.removeChild(textarea);
  };
  return { copied, copy };
}

const monoClass = "font-['DM_Mono:Regular',sans-serif] leading-[normal] not-italic text-[18px]";
const atypMedium = "font-['Atyp_BL:Medium',sans-serif]";
const atypBold = "font-['Atyp_BL:Bold',sans-serif]";
const featureSettings = { fontFeatureSettings: "'ss03', 'ss02', 'ss05', 'ss06'" } as const;

// ── MCP Server content ───────────────────────────────────────────────────────

function MCPServerContent() {
  const [activeTab, setActiveTab] = useState<MainTab>("interactive");
  const [installMethod, setInstallMethod] = useState<InstallMethod>("one-liner");
  const { copied, copy } = useCopyToClipboard();

  const isClientTab = activeTab !== "interactive";
  const activeCommand =
    isClientTab && installMethod === "npm"
      ? NPM_COMMANDS[activeTab as Client]
      : ONE_LINER_COMMANDS[activeTab];

  const handleCopy = () => copy(activeCommand.replace(/^\$ /, ""));
  const handleClientClick = (client: Client) => {
    setActiveTab(client);
    setInstallMethod("one-liner");
  };

  return (
    <>
      {/* Tab bar */}
      <div className="bg-[#1e2026] px-[30px] h-[70px] flex items-center gap-[24px] rounded-t-[16px]">
        {!isClientTab ? (
          <>
            <button
              onClick={() => setActiveTab("interactive")}
              className={`${monoClass} bg-[#6700ce] flex h-[38px] items-center justify-center px-[14px] py-[6px] rounded-[8px] shrink-0 text-white`}
            >
              Interactive
            </button>
            {CLIENT_TABS.map((client) => (
              <button
                key={client}
                onClick={() => handleClientClick(client)}
                className={`${monoClass} text-white hover:text-purple-300 transition-colors shrink-0`}
              >
                {CLIENT_LABELS[client]}
              </button>
            ))}
          </>
        ) : (
          <>
            <button
              onClick={() => { setActiveTab("interactive"); setInstallMethod("one-liner"); }}
              className={`${monoClass} shrink-0 transition-colors ${
                installMethod === "one-liner" ? "text-white" : "text-white/50 hover:text-white"
              }`}
            >
              One-Liner
            </button>
            <button
              onClick={() => setInstallMethod("npm")}
              className={`${monoClass} shrink-0 transition-colors ${
                installMethod === "npm" ? "text-white" : "text-white/50 hover:text-white"
              }`}
            >
              npm
            </button>
            {CLIENT_TABS.map((client) => (
              <button
                key={client}
                onClick={() => handleClientClick(client)}
                className={`${monoClass} shrink-0 transition-all ${
                  activeTab === client
                    ? "bg-[#6700ce] flex h-[38px] items-center justify-center px-[14px] py-[6px] rounded-[8px] text-white"
                    : "text-white hover:text-purple-300"
                }`}
              >
                {CLIENT_LABELS[client]}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Command area */}
      <div className="bg-[#14151a] px-[30px] py-[30px] flex flex-col gap-[14px] relative rounded-b-[16px]">
        {activeTab === "interactive" && (
          <p className={`${monoClass} text-[#5e6673]`}>
            Supported clients: claude, cursor, vscode, codex, opencode
          </p>
        )}
        <p className={`${monoClass} text-white whitespace-pre-wrap`}>
          {activeCommand}
        </p>
        <button
          onClick={handleCopy}
          title={copied ? "Copied!" : "Copy to clipboard"}
          className="absolute right-[20px] top-1/2 -translate-y-1/2 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] rounded-[8px] size-[36px] flex items-center justify-center transition-colors"
        >
          {copied ? (
            <span className="text-green-400 text-[14px]">&#10003;</span>
          ) : (
            <div className="relative size-[20px]">
              <CopyIcon />
            </div>
          )}
        </button>
      </div>
    </>
  );
}

// ── Skills content ───────────────────────────────────────────────────────────

function SkillsCodeBlock({ comment, command }: { comment: string; command: string }) {
  const { copied, copy } = useCopyToClipboard();
  const rawCmd = command.replace(/^\$ /, "");

  return (
    <div className="bg-[#14151a] rounded-[12px] px-[20px] py-[16px] flex flex-col gap-[6px] relative group">
      <p className={`${monoClass} text-[#5e6673]`}>{comment}</p>
      <p className={`${monoClass} text-white whitespace-pre-wrap`}>
        <span className="text-white/60">$ </span>
        <span className="text-[#22d3ee]">npx</span>
        <span className="text-white"> skills add </span>
        <span className="text-[#fbbf24]">{rawCmd.split("add ")[1]}</span>
      </p>
      <button
        onClick={() => copy(rawCmd)}
        title={copied ? "Copied!" : "Copy to clipboard"}
        className="absolute right-[12px] top-[12px] bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] rounded-[6px] size-[30px] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
      >
        {copied ? (
          <span className="text-green-400 text-[12px]">&#10003;</span>
        ) : (
          <div className="relative size-[16px]">
            <CopyIcon />
          </div>
        )}
      </button>
    </div>
  );
}

function SkillsContent() {
  return (
    <div className="flex flex-col gap-[16px]">
      <p className={`${atypMedium} text-[18px] text-white/80 leading-[1.5]`} style={featureSettings}>
        Install Orderly skills for enhanced agent capabilities:
      </p>

      <SkillsCodeBlock
        comment="# Install all skills globally"
        command="$ npx skills add OrderlyNetwork/skills --all -g"
      />
      <SkillsCodeBlock
        comment="# Install specific skill"
        command="$ npx skills add OrderlyNetwork/skills --skill orderly-trading-orders"
      />
      <SkillsCodeBlock
        comment="# Install for all agents"
        command="$ npx skills add OrderlyNetwork/skills --all --agent '*' -g"
      />

      {/* Info box */}
      <div className="bg-[#1e2026] rounded-[12px] px-[20px] py-[16px] flex flex-col gap-[8px]">
        <p className={`${atypMedium} text-[15px] text-white/80 leading-[1.5]`} style={featureSettings}>
          <span className={`${atypBold} text-[#fbbf24]`}>16 skills available:</span>{" "}
          API authentication, trading orders, positions, WebSocket streaming, SDK hooks, UI components, wallet connection, and more.
        </p>
        <p className={`${monoClass} text-[14px] text-white/40`}>
          Flags: <span className="text-white/60">--all</span> install all skills{" "}
          &bull; <span className="text-white/60">-g</span> global install{" "}
          &bull; <span className="text-white/60">--agent &apos;*&apos;</span> all agents
        </p>
      </div>
    </div>
  );
}

// ── Developer card (main export) ─────────────────────────────────────────────

type DevTab = "mcp-server" | "skills";

export default function DeveloperCard() {
  const [devTab, setDevTab] = useState<DevTab>("mcp-server");

  return (
    <div className="bg-[#0c0d10] rounded-[30px] p-[36px] flex flex-col gap-[24px] flex-1 min-w-0 border border-white/5">
      {/* Card header */}
      <div className="flex items-center gap-[12px]">
        <div className="size-[40px] rounded-full bg-[#2a2a35] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5z" fill="#999"/>
          </svg>
        </div>
        <div>
          <p className={`${atypBold} text-[20px] text-white leading-[1.3]`} style={featureSettings}>Developer</p>
          <p className={`${atypMedium} text-[14px] text-white/50 leading-[1.3]`} style={featureSettings}>Manual installation</p>
        </div>
      </div>

      {/* Description */}
      <p className={`${atypMedium} text-[18px] text-white/80 leading-[1.5]`} style={featureSettings}>
        Install Orderly&apos;s agentic tools for your AI client:
      </p>

      {/* MCP Server / Skills tabs */}
      <div className="flex items-center gap-[16px]">
        <button
          onClick={() => setDevTab("mcp-server")}
          className={`${atypMedium} text-[18px] px-[16px] py-[8px] rounded-[8px] transition-colors ${
            devTab === "mcp-server"
              ? "text-white"
              : "text-white/40 hover:text-white/70"
          }`}
          style={featureSettings}
        >
          MCP Server
        </button>
        <button
          onClick={() => setDevTab("skills")}
          className={`${atypMedium} text-[18px] px-[16px] py-[8px] rounded-[8px] transition-colors ${
            devTab === "skills"
              ? "bg-[#6700ce] text-white"
              : "text-white/40 hover:text-white/70"
          }`}
          style={featureSettings}
        >
          Skills
        </button>
      </div>

      {/* Tab content */}
      {devTab === "mcp-server" ? <MCPServerContent /> : <SkillsContent />}
    </div>
  );
}
