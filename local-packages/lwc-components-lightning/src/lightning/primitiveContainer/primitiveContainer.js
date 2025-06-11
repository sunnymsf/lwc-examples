import { LightningElement, api } from 'lwc';
import { reflectAttribute, normalizeInput } from 'lightning/primitiveUtils';
import 'lightning/primitiveThemeProvider';

export default class LightningPrimitiveContainer extends LightningElement {
  static shadowSupportMode = 'native';

  _role;
  _variant;

  @api headerDirection = 'row';
  @api bodyDirection = 'column';
  @api footerDirection = 'row';

  @api
  get role() {
    return this._role;
  }
  set role(value) {
    this._role = normalizeInput(value);
  }

  @api
  get variant() {
    return this._variant;
  }
  set variant(value) {
    this._variant = normalizeInput(value);
    reflectAttribute(this, 'variant', this._variant);
  }
}
