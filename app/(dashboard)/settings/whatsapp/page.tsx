
"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  MessageCircle,
  PlugZap,
  RefreshCw,
  ShieldCheck,
  Trash2,
  XCircle,
  KeyRound,
  X,
} from "lucide-react";

type WhatsAppAccount = {
  id: string;
  provider: string;
  phoneNumber: string | null;
  displayName: string | null;
  phoneNumberId: string | null;
  businessAccountId: string | null;
  branchId: string | null;
  status: string;
  lastConnectedAt: string | null;
  lastWebhookAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type Branch = {
  id: string;
  name: string;
};

export default function WhatsAppSettingsPage() {
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [businessAccountId, setBusinessAccountId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [branchId, setBranchId] = useState("");

  const [editingAccountId, setEditingAccountId] = useState<string | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(
    null
  );

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [accountsResponse, branchesResponse] = await Promise.all([
        fetch("/api/whatsapp/accounts", {
          cache: "no-store",
        }),
        fetch("/api/branches", {
          cache: "no-store",
        }),
      ]);

      const accountsData = await accountsResponse.json();
      const branchesData = await branchesResponse.json();

      if (!accountsResponse.ok) {
        throw new Error(
          accountsData?.message || "Failed to load WhatsApp accounts."
        );
      }

      setAccounts(accountsData.accounts || []);

      if (branchesResponse.ok) {
        setBranches(branchesData.branches || []);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load WhatsApp settings."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setPhoneNumberId("");
    setBusinessAccountId("");
    setAccessToken("");
    setPhoneNumber("");
    setDisplayName("");
    setBranchId("");
    setEditingAccountId(null);
  }

  function handleEditAccount(account: WhatsAppAccount) {
    setMessage("");
    setError("");

    setEditingAccountId(account.id);

    setPhoneNumberId(account.phoneNumberId || "");
    setBusinessAccountId(account.businessAccountId || "");
    setAccessToken("");
    setPhoneNumber(account.phoneNumber || "");
    setDisplayName(account.displayName || "");
    setBranchId(account.branchId || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleConnect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setConnecting(true);
    setError("");
    setMessage("");

    try {
      if (!phoneNumberId.trim()) {
        throw new Error("Phone Number ID is required.");
      }

      if (!accessToken.trim()) {
        throw new Error(
          editingAccountId
            ? "Enter the new Meta access token."
            : "Access Token is required."
        );
      }

      const response = await fetch("/api/whatsapp/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumberId: phoneNumberId.trim(),
          businessAccountId: businessAccountId.trim() || undefined,
          accessToken: accessToken.trim(),
          phoneNumber: phoneNumber.trim() || undefined,
          displayName: displayName.trim() || undefined,
          branchId: branchId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            (editingAccountId
              ? "Failed to update WhatsApp access token."
              : "Failed to connect WhatsApp.")
        );
      }

      setMessage(
        data?.message ||
          (editingAccountId
            ? "WhatsApp access token updated successfully."
            : "WhatsApp account connected successfully.")
      );

      resetForm();

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : editingAccountId
          ? "Failed to update WhatsApp access token."
          : "Failed to connect WhatsApp."
      );
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect(id: string) {
    const confirmed = window.confirm(
      "Disconnect this WhatsApp account? VisionFlow will stop using its saved access token."
    );

    if (!confirmed) {
      return;
    }

    setDisconnectingId(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/whatsapp/accounts/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to disconnect WhatsApp."
        );
      }

      setMessage(
        data?.message || "WhatsApp account disconnected successfully."
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to disconnect WhatsApp."
      );
    } finally {
      setDisconnectingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <MessageCircle size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              WhatsApp Integration
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Connect your clinic to the Meta WhatsApp Cloud API.
            </p>
          </div>
        </div>
      </div>

      {/* Success */}
      {message && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0 text-green-600"
          />

          <span>{message}</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <XCircle
            size={19}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <span>{error}</span>
        </div>
      )}

      {/* Connection form */}
      <div className="card">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <PlugZap className="text-blue-600" size={21} />

              <div>
                <h2 className="font-semibold text-slate-900">
                  {editingAccountId
                    ? "Update WhatsApp Access Token"
                    : "Connect WhatsApp"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingAccountId
                    ? "Replace the Meta access token for this connected WhatsApp account."
                    : "Enter the credentials provided by Meta for your WhatsApp Business account."}
                </p>
              </div>
            </div>

            {editingAccountId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <X size={16} />
                Cancel
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleConnect} className="space-y-6 p-6">
          {/* Phone Number ID */}
          <div>
            <label
              htmlFor="phoneNumberId"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Phone Number ID
            </label>

            <input
              id="phoneNumberId"
              type="text"
              value={phoneNumberId}
              onChange={(event) =>
                setPhoneNumberId(event.target.value)
              }
              placeholder="e.g. 1330258290170837"
              className="input"
              autoComplete="off"
              required
            />

            <p className="mt-1.5 text-xs text-slate-500">
              This is the ID used in your Meta Graph API URL.
            </p>
          </div>

          {/* Business Account ID */}
          <div>
            <label
              htmlFor="businessAccountId"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              WhatsApp Business Account ID
            </label>

            <input
              id="businessAccountId"
              type="text"
              value={businessAccountId}
              onChange={(event) =>
                setBusinessAccountId(event.target.value)
              }
              placeholder="Enter your WhatsApp Business Account ID"
              className="input"
              autoComplete="off"
            />
          </div>

          {/* Access Token */}
          <div>
            <label
              htmlFor="accessToken"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Meta Access Token
            </label>

            <textarea
              id="accessToken"
              value={accessToken}
              onChange={(event) =>
                setAccessToken(event.target.value)
              }
              placeholder={
                editingAccountId
                  ? "Paste your new permanent Meta access token here"
                  : "Paste your Meta access token here"
              }
              className="input min-h-[120px] resize-y font-mono text-xs"
              autoComplete="off"
              spellCheck={false}
              required
            />

            <div className="mt-2 flex items-start gap-2 text-xs text-slate-500">
              <ShieldCheck
                size={15}
                className="mt-0.5 shrink-0 text-green-600"
              />

              <span>
                Your access token is sent securely to the server and
                encrypted before being stored. It is never returned to
                the browser after connection.
              </span>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phoneNumber"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              WhatsApp Phone Number
              <span className="ml-1 font-normal text-slate-400">
                (optional)
              </span>
            </label>

            <input
              id="phoneNumber"
              type="text"
              value={phoneNumber}
              onChange={(event) =>
                setPhoneNumber(event.target.value)
              }
              placeholder="+15551512937"
              className="input"
              autoComplete="off"
            />
          </div>

          {/* Display name */}
          <div>
            <label
              htmlFor="displayName"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Display Name
              <span className="ml-1 font-normal text-slate-400">
                (optional)
              </span>
            </label>

            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(event) =>
                setDisplayName(event.target.value)
              }
              placeholder="VisionFlow WhatsApp"
              className="input"
              autoComplete="off"
            />
          </div>

          {/* Branch */}
          {branches.length > 0 && (
            <div>
              <label
                htmlFor="branchId"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Branch
                <span className="ml-1 font-normal text-slate-400">
                  (optional)
                </span>
              </label>

              <select
                id="branchId"
                value={branchId}
                onChange={(event) =>
                  setBranchId(event.target.value)
                }
                className="input"
              >
                <option value="">
                  All clinic / no specific branch
                </option>

                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end border-t border-slate-200 pt-5">
            <button
              type="submit"
              disabled={connecting}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {connecting ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  {editingAccountId
                    ? "Updating..."
                    : "Connecting..."}
                </>
              ) : (
                <>
                  {editingAccountId ? (
                    <KeyRound size={18} />
                  ) : (
                    <MessageCircle size={18} />
                  )}

                  {editingAccountId
                    ? "Update Access Token"
                    : "Connect WhatsApp"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Connected accounts */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="font-semibold text-slate-900">
              Connected WhatsApp Accounts
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              WhatsApp accounts currently connected to this clinic.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center px-6 py-14 text-sm text-slate-500">
            <Loader2
              size={20}
              className="mr-2 animate-spin"
            />
            Loading WhatsApp accounts...
          </div>
        ) : accounts.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <MessageCircle
              size={36}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-semibold text-slate-800">
              No WhatsApp account connected
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Connect your Meta WhatsApp account above to start
              sending and receiving WhatsApp messages through
              VisionFlow.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {accounts.map((account) => {
              const connected = account.status === "connected";

              return (
                <div
                  key={account.id}
                  className="flex flex-col gap-5 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                        connected
                          ? "bg-green-50 text-green-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {connected ? (
                        <CheckCircle2 size={21} />
                      ) : (
                        <MessageCircle size={21} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {account.displayName ||
                            account.phoneNumber ||
                            "WhatsApp Account"}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            connected
                              ? "bg-green-50 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {account.status}
                        </span>
                      </div>

                      <div className="mt-2 space-y-1 text-sm text-slate-500">
                        <p>
                          Phone Number ID:{" "}
                          <span className="font-mono text-xs text-slate-700">
                            {account.phoneNumberId || "—"}
                          </span>
                        </p>

                        <p>
                          Business Account ID:{" "}
                          <span className="font-mono text-xs text-slate-700">
                            {account.businessAccountId || "—"}
                          </span>
                        </p>

                        {account.phoneNumber && (
                          <p>Phone: {account.phoneNumber}</p>
                        )}

                        {account.lastConnectedAt && (
                          <p>
                            Last connected:{" "}
                            {new Date(
                              account.lastConnectedAt
                            ).toLocaleString()}
                          </p>
                        )}

                        {account.lastWebhookAt && (
                          <p>
                            Last webhook:{" "}
                            {new Date(
                              account.lastWebhookAt
                            ).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    {connected && (
                      <button
                        type="button"
                        onClick={() =>
                          handleEditAccount(account)
                        }
                        disabled={connecting}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <KeyRound size={17} />
                        Update Access Token
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        handleDisconnect(account.id)
                      }
                      disabled={
                        disconnectingId === account.id
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {disconnectingId === account.id ? (
                        <>
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                          Disconnecting...
                        </>
                      ) : (
                        <>
                          <Trash2 size={17} />
                          Disconnect
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* API information */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-blue-600"
          />

          <div>
            <h3 className="font-semibold text-blue-900">
              Meta Cloud API
            </h3>

            <p className="mt-1 text-sm leading-6 text-blue-800">
              VisionFlow is configured to communicate with Meta
              through the Graph API. Your current API version is{" "}
              <strong>v25.0</strong>.
            </p>

            <p className="mt-2 text-xs text-blue-700">
              The access token is stored encrypted on the server and
              is never exposed through the account API.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

