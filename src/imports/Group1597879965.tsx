import { useState } from "react";
import svgPaths from "./svg-t3rwygkbpy";

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

export default function Group() {
  const [activeTab, setActiveTab] = useState<MainTab>("interactive");
  const [installMethod, setInstallMethod] = useState<InstallMethod>("one-liner");
  const [copied, setCopied] = useState(false);

  const isClientTab = activeTab !== "interactive";

  const activeCommand =
    isClientTab && installMethod === "npm"
      ? NPM_COMMANDS[activeTab as Client]
      : ONE_LINER_COMMANDS[activeTab];

  const handleCopy = () => {
    const textToCopy = activeCommand.replace(/^\$ /, "");
    // Fallback copy method that works without clipboard permissions
    const textarea = document.createElement('textarea');
    textarea.value = textToCopy;
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

  const handleClientClick = (client: Client) => {
    setActiveTab(client);
    setInstallMethod("one-liner");
  };

  const monoClass = "font-['DM_Mono:Regular',sans-serif] leading-[normal] not-italic text-[24px]";

  return (
    <div className="relative w-[1302px]" data-name="Group">
      {/* Card */}
      <div className="bg-[#14151a] rounded-[30px] overflow-hidden w-full">

        {/* Header bar */}
        <div className="bg-[#1e2026] px-[44px] h-[98.46px] flex items-center gap-[78px]">
          {!isClientTab ? (
            /* Interactive mode: Interactive(active) | Claude | Cursor | VScode | Codex | Opencode */
            <>
              <button
                onClick={() => setActiveTab("interactive")}
                className={`${monoClass} bg-[#6700ce] flex h-[47px] items-center justify-center px-[17px] py-[8px] rounded-[8px] shrink-0 text-white`}
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
            /* Client mode: One-Liner | npm | [clients with active highlighted] */
            <>
              <button
                onClick={() => setInstallMethod("one-liner")}
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
                      ? "bg-[#6700ce] flex h-[47px] items-center justify-center px-[17px] py-[8px] rounded-[8px] text-white"
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
        <div className="bg-[#14151a] px-[44px] py-[47px] flex flex-col gap-[20px] relative min-h-[172px]">
          {activeTab === "interactive" && (
            <p className={`${monoClass} text-[#5e6673]`}>
              Supported clients: claude, cursor, vscode, codex, opencode
            </p>
          )}
          <p className={`${monoClass} text-white whitespace-pre-wrap`}>
            {activeCommand}
          </p>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            title={copied ? "Copied!" : "Copy to clipboard"}
            className="absolute right-[40px] top-1/2 -translate-y-1/2 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] rounded-[8px] size-[40px] flex items-center justify-center transition-colors"
          >
            {copied ? (
              <span className="text-green-400 text-[14px]">✓</span>
            ) : (
              <div className="relative size-[24px]">
                <CopyIcon />
              </div>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
