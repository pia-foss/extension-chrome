import { createSelector, ElementDescriptor, Node } from '../../../core';
import { Text } from '../../../elements';
import { Tile } from './tile';

class SubscriptionTile extends Tile {
  public static readonly SUBSCRIPTION_PERIODS = [
    'yearly',
    'monthly',
    'trial',
  ];

  public period: Text;
  public remaining: Text;
  public header: Text;

  constructor(descriptor: ElementDescriptor, parent?: Node) {
    super(descriptor, parent);
    this.header = new Text(
      {
        selector: createSelector({
          value: '.subscription-header',
        }),
        name: 'subscription header',
      },
      this,
    );
    this.period = new Text(
      {
        selector: createSelector({
          value: '.subscription-plan',
        }),
        name: 'subscription period',
      },
      this,
    );
    this.remaining = new Text(
      {
        selector: createSelector({
          value: '.subscription-expiration',
        }),
        name: 'subscription remaining',
      },
      this,
    );
  }
}

export { SubscriptionTile };
