import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as React from 'react';
import * as ReactDom from 'react-dom';

import * as strings from 'DeveloperToolkitWebPartStrings';
import { SPContext } from 'spfx-toolkit/lib/utilities/context';
import '../pnpImports';
import DeveloperToolkit from './components/DeveloperToolkit';

export interface IDeveloperToolkitWebPartProps {
  description: string;
}

export default class DeveloperToolkitWebPart extends BaseClientSideWebPart<IDeveloperToolkitWebPartProps> {
  public render(): void {
    const element: React.ReactElement<{}> = React.createElement(DeveloperToolkit, {
      context: this.context,
    });

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    await SPContext.development(this.context, 'DeveloperToolkitWebPart');
    return super.onInit();
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
