import {
  DatabaseKanbanViewIcon,
  DatabaseSearchClose,
  DatabaseTableViewIcon,
} from '@blocksuite/global/config';
import { WidgetElement } from '@blocksuite/lit';
import { assertExists } from '@blocksuite/store';
import { html, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

import { columnManager } from '../../database-block/common/columns/manager.js';
import { multiSelectPureColumnConfig } from '../../database-block/common/columns/multi-select/define.js';
import type { DatabaseBlockModel } from '../../database-block/database-model.js';
import { isPageComponent } from '../../page-block/utils/guard.js';
import { getSelectedContentModels } from '../../page-block/utils/selection.js';
import { styles } from './styles.js';

type DatabaseViewName = 'table' | 'kanban';

interface DatabaseView {
  type: DatabaseViewName;
  text: string;
  icon: TemplateResult;
  description?: string;
  isComingSoon?: boolean;
}

const databaseViews: DatabaseView[] = [
  {
    type: 'table',
    text: 'Table view',
    icon: DatabaseTableViewIcon,
  },
  {
    type: 'kanban',
    text: 'Kanban view',
    icon: DatabaseKanbanViewIcon,
    description: 'Coming soon',
    isComingSoon: true,
  },
];

export const AFFINE_DATABASE_CONVERT_WIDGET_TAG =
  'affine-database-convert-widget';

export const DATABASE_CONVERT_WHITE_LIST = ['affine:list', 'affine:paragraph'];

@customElement(AFFINE_DATABASE_CONVERT_WIDGET_TAG)
export class AffineDatabaseConvertWidget extends WidgetElement {
  static override styles = styles;

  override firstUpdated() {
    this.style.display = 'none';
  }

  private _convertToDatabase(viewType: DatabaseViewName) {
    const pageElement = this.pageElement;
    if (!isPageComponent(pageElement)) {
      throw new Error(
        'database convert widget must be hosted in page component'
      );
    }
    const selectedModels = getSelectedContentModels(pageElement);
    //TODO: kanban view
    if (viewType !== 'table' || selectedModels.length === 0) return;

    this.page.captureSync();

    const parentModel = this.page.getParent(selectedModels[0]);
    assertExists(parentModel);

    const id = this.page.addBlock(
      'affine:database',
      {
        columns: [],
        titleColumnName: 'Title',
      },
      parentModel,
      parentModel.children.indexOf(selectedModels[0])
    );

    const databaseModel = this.page.getBlockById(id) as DatabaseBlockModel;
    assertExists(databaseModel);

    // default column
    databaseModel.addColumn(
      'end',
      columnManager
        .getColumn(multiSelectPureColumnConfig.type)
        .create('Tag', { options: [] })
    );
    databaseModel.applyColumnUpdate();

    this.page.moveBlocks(selectedModels, databaseModel);

    this.style.display = 'none';
  }

  override render() {
    return html`<div class=${AFFINE_DATABASE_CONVERT_WIDGET_TAG}>
      <div
        @click=${() => {
          this.style.display = 'none';
        }}
        class="overlay-mask"
      ></div>
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-header-title">Select Database View</div>
          <div class="modal-header-close-icon">${DatabaseSearchClose}</div>
        </div>
        <div class="modal-body">
          <div class="modal-desc">
            Group as Database can quickly convert selected blocks into Database
            for easy structuring of data.
          </div>
          <div class="modal-view-container">
            ${databaseViews.map(view => {
              return html`
                <div
                  class="modal-view-item ${view.type} ${view.isComingSoon
                    ? 'coming-soon'
                    : ''}"
                  @click=${() => this._convertToDatabase(view.type)}
                >
                  <div class="modal-view-item-content">
                    <div class="modal-view-item-icon">${view.icon}</div>
                    <div class="modal-view-item-text">${view.text}</div>
                  </div>
                  <div class="modal-view-item-description">
                    ${view.description}
                  </div>
                </div>
              `;
            })}
          </div>
        </div>
        <div class="modal-footer">More views are on the way.</div>
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [AFFINE_DATABASE_CONVERT_WIDGET_TAG]: AffineDatabaseConvertWidget;
  }
}
