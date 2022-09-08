import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";

import { createNetwork } from "~/models/network.server";
import { requireUserId } from "~/session.server";

type ActionData = {
  errors?: {
    title?: string;
    // body?: string;
    url?: string;
    isTest?: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const title = formData.get("title");
  const url = formData.get("url");
  const isTest = formData.get("isTest")?.toString().toLowerCase() == "true";

  if (typeof title !== "string" || title.length === 0) {
    return json<ActionData>(
      { errors: { title: "Title is required" } },
      { status: 400 }
    );
  }

  if (typeof url !== "string" || url.length === 0) {
    return json<ActionData>(
      { errors: { url: "Url is required" } },
      { status: 400 }
    );
  }

  const network = await createNetwork({ userId, title, url, isTest });

  //return redirect(`/notes/${note.id}`);
  return redirect(`/admin/network/${network.id}`);
};

export default function NewNetworkPage() {
  const actionData = useActionData() as ActionData;
  const titleRef = React.useRef<HTMLInputElement>(null);
  //const bodyRef = React.useRef<HTMLTextAreaElement>(null);
  const urlRef = React.useRef<HTMLInputElement>(null);
  const isTestRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    // } else if (actionData?.errors?.body) {
    //   bodyRef.current?.focus();
    } else if (actionData?.errors?.url) {
      urlRef.current?.focus();
    } else if (actionData?.errors?.isTest) {
      isTestRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Title: </span>
          <input
            ref={titleRef}
            name="title"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.title ? true : undefined}
            aria-errormessage={
              actionData?.errors?.title ? "title-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.title && (
          <div className="pt-1 text-red-700" id="title-error">
            {actionData.errors.title}
          </div>
        )}
      </div>

      {/* <div>
        <label className="flex w-full flex-col gap-1">
          <span>Body: </span>
          <textarea
            ref={bodyRef}
            name="body"
            rows={8}
            className="w-full flex-1 rounded-md border-2 border-blue-500 py-2 px-3 text-lg leading-6"
            aria-invalid={actionData?.errors?.body ? true : undefined}
            aria-errormessage={
              actionData?.errors?.body ? "body-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.body && (
          <div className="pt-1 text-red-700" id="body-error">
            {actionData.errors.body}
          </div>
        )}
      </div> */}

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Url: </span>
          <input
            ref={urlRef}
            name="url"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.url ? true : undefined}
            aria-errormessage={
              actionData?.errors?.url ? "url-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.url && (
          <div className="pt-1 text-red-700" id="url-error">
            {actionData.errors.url}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Is Test: </span>
          <input
            ref={isTestRef}
            type="checkbox"
            value="true"
            name="isTest"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.isTest ? true : undefined}
            aria-errormessage={
              actionData?.errors?.isTest ? "isTest-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.isTest && (
          <div className="pt-1 text-red-700" id="isTest-error">
            {actionData.errors.isTest}
          </div>
        )}
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>
    </Form>
  );
}
