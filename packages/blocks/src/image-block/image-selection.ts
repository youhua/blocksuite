import { BaseSelection, PathFinder } from '@blocksuite/block-std';

export class ImageSelection extends BaseSelection {
  static override type = 'image';

  override equals(other: BaseSelection): boolean {
    if (other instanceof ImageSelection) {
      return PathFinder.equals(this.path, other.path);
    }
    return false;
  }

  override toJSON(): Record<string, unknown> {
    return {
      type: this.type,
      path: this.path,
    };
  }

  static override fromJSON(json: Record<string, unknown>): ImageSelection {
    return new ImageSelection({
      path: json.path as string[],
    });
  }
}

declare global {
  interface BlockSuiteSelection {
    image: typeof ImageSelection;
  }
}
