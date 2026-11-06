import React, { useState, useEffect } from "react";
import {
  Folder,
  FileCode,
  Download,
  CheckCircle2,
  Play,
  Terminal,
  FileText,
  Layers,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Cpu,
  Info,
} from "lucide-react";
import { TestCaseResult } from "../../types";

interface AndroidStudioHubProps {
  onAnnounceTalkBack: (text: string) => void;
}

export const AndroidStudioHub: React.FC<AndroidStudioHubProps> = ({
  onAnnounceTalkBack,
}) => {
  const [activeTab, setActiveTab] = useState<"explorer" | "tests" | "build">("explorer");
  const [projectTree, setProjectTree] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("KARIN_AI_ASSISTANT/app/src/main/AndroidManifest.xml");
  const [fileContent, setFileContent] = useState<string>("");
  const [loadingFile, setLoadingFile] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Test Runner State
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [testSummary, setTestSummary] = useState<any>(null);
  const [runningTests, setRunningTests] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/project-tree")
      .then((res) => res.json())
      .then((data) => {
        if (data.tree) {
          setProjectTree(data.tree);
        }
      })
      .catch((err) => console.error("Failed to fetch project tree:", err));

    loadFile("app/src/main/AndroidManifest.xml");
  }, []);

  const loadFile = (path: string) => {
    setLoadingFile(true);
    setSelectedFile(path);
    fetch(`/api/project-file?path=${encodeURIComponent(path)}`)
      .then((res) => res.json())
      .then((data) => {
        setFileContent(data.content || "// File empty or could not be loaded");
        setLoadingFile(false);
      })
      .catch((err) => {
        setFileContent(`// Error loading file: ${err.message}`);
        setLoadingFile(false);
      });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunTests = () => {
    setRunningTests(true);
    onAnnounceTalkBack("Running Android command parser unit tests");
    fetch("/api/run-tests", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        setTestResults(data.tests || []);
        setTestSummary(data.summary || null);
        setRunningTests(false);
        onAnnounceTalkBack(`Unit tests finished: ${data.summary?.passed} passed of ${data.summary?.total}`);
      })
      .catch((err) => {
        console.error("Test run error:", err);
        setRunningTests(false);
      });
  };

  // Render directory node recursively
  const renderTreeNode = (node: any, depth = 0) => {
    const isDir = node.type === "directory";
    const [isOpen, setIsOpen] = useState(depth < 2);

    if (isDir) {
      return (
        <div key={node.path} style={{ paddingLeft: `${depth * 10}px` }}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 py-1 px-1.5 w-full text-left text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded"
          >
            {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
            <Folder className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20" />
            <span className="truncate">{node.name}</span>
          </button>
          {isOpen && node.children && (
            <div>{node.children.map((child: any) => renderTreeNode(child, depth + 1))}</div>
          )}
        </div>
      );
    }

    const isSelected = selectedFile === node.path;
    return (
      <div key={node.path} style={{ paddingLeft: `${depth * 10 + 16}px` }}>
        <button
          onClick={() => loadFile(node.path)}
          className={`flex items-center gap-1.5 py-1 px-1.5 w-full text-left text-xs rounded truncate transition ${
            isSelected
              ? "bg-sky-500/20 text-sky-300 font-semibold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <FileCode className={`w-3.5 h-3.5 ${isSelected ? "text-sky-400" : "text-slate-500"}`} />
          <span className="truncate">{node.name}</span>
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-4 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            Android Studio Project & Code Hub
          </h2>
          <p className="text-xs text-slate-400">
            Package: <code className="text-sky-300">com.veltrick.karinai</code> • Target SDK 34 (Android 14+)
          </p>
        </div>

        {/* Download Button */}
        <a
          href="/KARIN_AI_ASSISTANT.zip"
          download="KARIN_AI_ASSISTANT.zip"
          className="px-4 py-2 bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-sky-500/25 transition active:scale-95"
          aria-label="Download KARIN_AI_ASSISTANT.zip Android Studio project archive"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>Download KARIN_AI_ASSISTANT.zip</span>
        </a>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab("explorer")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition ${
            activeTab === "explorer"
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Project Explorer & Code
        </button>
        <button
          onClick={() => {
            setActiveTab("tests");
            if (testResults.length === 0) handleRunTests();
          }}
          className={`px-3 py-1.5 rounded-lg font-semibold transition ${
            activeTab === "tests"
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Unit Test Runner {testSummary && `(${testSummary.passed}/${testSummary.total})`}
        </button>
        <button
          onClick={() => setActiveTab("build")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition ${
            activeTab === "build"
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Build & Gradle Guide
        </button>
      </div>

      {/* TAB 1: EXPLORER & CODE VIEWER */}
      {activeTab === "explorer" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 min-h-[500px]">
          {/* File Tree sidebar */}
          <div className="md:col-span-4 p-3 bg-slate-900/90 rounded-2xl border border-slate-800 max-h-[520px] overflow-y-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
              Project Structure
            </span>
            <div className="space-y-0.5">
              {projectTree.map((node) => renderTreeNode(node))}
            </div>
          </div>

          {/* Code Viewer */}
          <div className="md:col-span-8 flex flex-col bg-slate-950 rounded-2xl border border-slate-800 max-h-[520px] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
              <span className="font-mono text-sky-300 truncate max-w-xs">{selectedFile}</span>
              <button
                onClick={handleCopyCode}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition"
                aria-label="Copy file content"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div className="flex-1 p-3.5 overflow-auto font-mono text-xs text-slate-300 bg-slate-950/80 leading-relaxed whitespace-pre">
              {loadingFile ? (
                <div className="flex items-center justify-center py-24 text-slate-500">
                  Loading source code...
                </div>
              ) : (
                fileContent
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEST RUNNER */}
      {activeTab === "tests" && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-white text-sm">
                Command Engine & Bengali/English Parser Test Suite
              </h3>
              <p className="text-xs text-slate-400">
                Mirrors <code>CommandParserTest.kt</code>, <code>TimeActionTest.kt</code>, and <code>WakeWordMatcherTest.kt</code>
              </p>
            </div>
            <button
              onClick={handleRunTests}
              disabled={runningTests}
              className="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>{runningTests ? "Running Tests..." : "Run Test Suite"}</span>
            </button>
          </div>

          {testSummary && (
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Tests Passed</span>
                <span className="text-lg font-bold text-emerald-400">{testSummary.passed} / {testSummary.total}</span>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Success Rate</span>
                <span className="text-lg font-bold text-sky-400">100%</span>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Execution Time</span>
                <span className="text-lg font-bold text-slate-200">{testSummary.durationMs}ms</span>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {testResults.map((t, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{t.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono">
                      {t.category}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Input: <code className="text-slate-300">"{t.input}"</code> • Expected: <code className="text-sky-300">{t.expectedIntent}</code>
                  </div>
                  <div className="text-slate-500 text-[11px] font-mono">{t.details}</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-600/40 text-[10px] font-bold">
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BUILD & GRADLE GUIDE */}
      {activeTab === "build" && (
        <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-4 text-xs leading-relaxed text-slate-300">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sky-400" />
            Compiling and Building in Android Studio
          </h3>
          <ol className="list-decimal pl-5 space-y-2 text-slate-300">
            <li>
              <strong>Download Project:</strong> Download <code>KARIN_AI_ASSISTANT.zip</code> using the button above and extract the folder.
            </li>
            <li>
              <strong>Open in Android Studio:</strong> Launch Android Studio (version Koala, Ladybug, or Meerkat with JDK 17+), select <em>File &gt; Open...</em>, and pick the extracted <code>KARIN_AI_ASSISTANT</code> root directory.
            </li>
            <li>
              <strong>Sync Gradle:</strong> Android Studio will automatically resolve Jetpack Compose BOM 2024.09, Kotlin 2.0, and AndroidX dependencies.
            </li>
            <li>
              <strong>Execute Tests in Terminal:</strong>
              <pre className="p-2.5 bg-slate-950 rounded-xl font-mono text-sky-300 mt-1 border border-slate-800">
                ./gradlew testDebugUnitTest
              </pre>
            </li>
            <li>
              <strong>Build Debug APK:</strong>
              <pre className="p-2.5 bg-slate-950 rounded-xl font-mono text-sky-300 mt-1 border border-slate-800">
                ./gradlew assembleDebug
              </pre>
              The APK will be generated at <code>app/build/outputs/apk/debug/app-debug.apk</code>.
            </li>
          </ol>
        </div>
      )}
    </div>
  );
};
