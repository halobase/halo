<script>
  import { Icon } from "$lib";
  import { pre_signed_upload } from "$lib/actions/input";
  import { __files } from "./store";

  export let accept = "image/*";
  export let icon = "image";
  export let title = "添加图片";

  /**
   * @param {Error} e
   * @param {number} i
   */
  async function __error(e, i) {
    __files.update((files) => {
      files[i].state = "failed_upload";
      return files;
    });
  }

  /**
   * @param {import("$lib/types").File} file
   * @param {number} i
   */
  async function __progress(file, i) {
    __files.update((files) => {
      files[i] = file;
      return files;
    });
  }

  /** @param {FileList} files  */
  async function __input(files) {
    __files.update((old_files) => [
      ...old_files,
      ...Array.from(files).map((file) => ({
        pre_signed_url: "",
        type: file.type,
        name: file.name,
        size: file.size,
        state: "uploading",
      }))
    ]);
  }
</script>

<label class="btn btn-sm btn-ghost btn-square" {title}>
  <input
    class="hidden"
    type="file"
    name="file"
    {accept}
    multiple
    use:pre_signed_upload={{
      url_pre_sign: "/_api/files/pre-signed-url",
      url_file: "/_api/files",
      error: __error,
      input: __input,
      progress: __progress
    }}
  />
  <Icon {icon} />
</label>
