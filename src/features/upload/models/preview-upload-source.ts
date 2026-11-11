import type { ChosenFile, MyUpload, UploadSource, UploadValues, UploaderMode } from './upload';

/**
 * Stand-in until uploads exist in the API: the file never leaves the browser.
 * Progress is simulated so the screen can be clicked through.
 * TODO(backend): R2 signed upload + content API. TODO(content): sample uploads.
 */
export class PreviewUploadSource implements UploadSource {
  constructor(
    private readonly stepMs = 120,
    private readonly steps = 10,
  ) {}

  async sendFile(
    file: ChosenFile,
    onProgress: (share: number) => void,
  ): Promise<{ fileId: string }> {
    for (let i = 1; i <= this.steps; i++) {
      if (this.stepMs > 0) await new Promise((r) => setTimeout(r, this.stepMs));
      onProgress(i / this.steps);
    }
    return { fileId: `preview-${file.name}` };
  }

  async submit(
    values: UploadValues,
    mode: UploaderMode,
  ): Promise<{ ok: boolean; reference: string }> {
    if (this.stepMs > 0) await new Promise((r) => setTimeout(r, this.stepMs * 3));
    const prefix = values.kind === 'book' && values.bookChoice === 'list' ? 'RL' : 'UP';
    return {
      ok: true,
      reference: `${prefix}-${mode === 'guest' ? 'G' : 'M'}${Date.now() % 100000}`,
    };
  }

  async myUploads(): Promise<MyUpload[]> {
    return [
      {
        id: 'u1',
        title: 'Tree traversals cheat sheet',
        detail: 'CSC 2100, 214 views',
        status: 'live',
      },
      {
        id: 'u2',
        title: 'Deadlocks summary',
        detail: 'CSC 2104, sent yesterday',
        status: 'review',
      },
      {
        id: 'u3',
        title: 'Normalisation exercises',
        detail: 'CSC 2110',
        status: 'changes',
        moderatorNote: 'Page 3 is blurry, please retake the photo.',
      },
    ];
  }
}
