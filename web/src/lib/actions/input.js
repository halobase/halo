/** @type {import("svelte/action").Action<HTMLInputElement, import("./types").PreSignedUploadParams>} */
export function pre_signed_upload(node, params) {
  /** @param {import("./types").FileInputEvent} e */
  async function __input(e) {
    const files = e.target?.files;

    if (files) {
      if (params.input) {
        await params.input(files);
      }
      await Promise.all(Array.from(files).map(async (file, i) => {
        // Step 1: Fetch pre-signed URL
        const res_pre_sign = await fetch(params.url_pre_sign, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            method: "PUT",
            name: file.name,
            type: file.type,
          }),
        });
        if (!res_pre_sign.ok) {
          if (params.error) {
            params.error(new Error(`[${res_pre_sign.status}] failed to fetch pre-signed URL`), i);
          }
          if (params.stop_on_error) {
            return;
          }
        }

        /** @type {import("./types").PreSignedURL} */
        const pre_signed_url = await res_pre_sign.json();

        // Step 2: Put the file to the pre-signed URL
        const res_put_file = await fetch(pre_signed_url.url, {
          method: "PUT",
          headers: {
            "content-type": file.type,
          },
          body: file,
        });
        if (!res_put_file.ok) {
          if (params.error) {
            params.error(new Error(`[${res_put_file.status}] failed to put the file`), i);
          }
          if (params.stop_on_error) {
            return;
          }
        }

        // Step 3: Create a file reference to the uploaded file.
        const res_create_ref = await fetch(params.url_file, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            type: file.type,
            name: file.name,
            size: file.size,
            object_key: pre_signed_url.object_key,
          }),
        });
        if (!res_create_ref.ok) {
          if (params.error) {
            params.error(new Error(`[${res_create_ref.status}] failed to create the file reference`), i);
          }
          if (params.stop_on_error) {
            return;
          }
        }

        if (params.progress) {
          await params.progress(await res_create_ref.json(), i);
        }
      }));
    }
  }
  node.addEventListener("input", __input, true);
  return {
    destroy() {
      node.removeEventListener("input", __input, true);
    }
  }
}