import initCheckboxField from 'component/checkboxfield'

export default function(renderer, app) {
  const React         = renderer.react,
        CheckboxField = initCheckboxField(renderer, app)

  class RememberMeField extends CheckboxField {
    onChange(e) {
      const {checked} = e.currentTarget;
      const {user} = app.util;
      user.setRememberMe(checked);
      this.setState(() => ({
        isChecked: checked,
      }));
    }
  }

  return RememberMeField
}
