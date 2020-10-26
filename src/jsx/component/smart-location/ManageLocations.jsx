import PropTypes from 'prop-types';
import React, { Component } from 'react';
import withAppContext from '@hoc/withAppContext';
import SmartLocationItem from './SmartLocationItem';
import Select from 'react-select';

class ManageLocations extends Component {
  constructor(props) {
    super(props);
    

    // properties
    this.app = props.context.app;
    this.bypasslist = this.app.util.bypasslist;
    this.region = this.app.util.regionlist.getSelectedRegion();
    this.regionlist = this.app.util.regionlist;
    this.smartlocation = this.app.util.smartlocation;
    this.storage = this.app.util.storage;
    this.i18n = this.app.util.i18n;
    this.state = {
      classNames:{
        inputRule:'add-rule-input'
      },
      userInput: this.smartlocation.currentTabUrl,
      userSelect:'',
      checked:this.smartlocation.getSmartLocationRules('checkSmartLocation'),
      userRules: this.smartlocation.getSmartLocationRules('smartLocationRules'),
      indexEdit:null,
      edit:false
    };

    // bindings
    this.save = this.save.bind(this);
    this.createRemoveRule = this.createRemoveRule.bind(this);
    this.createBypassItem = this.createBypassItem.bind(this);
    this.onUserInputChange = this.onUserInputChange.bind(this);
    this.setChecked = this.setChecked.bind(this);
    this.onUserSelectChange = this.onUserSelectChange.bind(this);
    this.exit = this.exit.bind(this);
    this.edit = this.edit.bind(this);
    this.verifyDomains = this.verifyDomains.bind(this)
  }

  async reinitializedProxy(){
    this.selectedRegionSmartLoc = null;
    if (this.app.proxy.getEnabled()) {
      await this.app.proxy.enable();
    }
  }

  onUserInputChange(e) {
    this.setState({ userInput: e.currentTarget.value });
  }
  
  onUserSelectChange(e){
    this.setState({ userSelect: e.value });
  }

  setChecked(value){
    this.setState({ checked: value });
    this.storage.setItem('checkSmartLocation', value);
    this.reinitializedProxy();
  }

  verifyDomains(){ 
    const { userInput,userRules } = this.state;
    userRules.map(smartLoc=>{
      if(smartLoc.userRules == userInput){
        this.setState({
          indexEdit:userRules.findIndex(location => location.userRules == smartLoc.userRules),
          userSelect:smartLoc.userSelect,
          edit:true });
      }
    })
  }

  verifyAndChangeState(className){
    this.setState({
      classNames:{
        inputRule:className
      }
    })
  }

  save() {
    const { userInput,userSelect } = this.state;
    this.verifyAndChangeState('add-rule-input');
    if(userInput && userSelect && this.verifyDomainPattern(userInput) && this.verifyIfDomainExists(userInput)){
      this.smartlocation.addSmartLocation(userInput,userSelect);
      this.clear();
    }else{
      this.verifyAndChangeState('add-rule-input-error');
    }
   
  }
  edit(){
    const { userInput,userSelect,indexEdit } = this.state;
    this.verifyAndChangeState('add-rule-input');
    if(userInput.length > 0 && userSelect && this.verifyDomainPattern(userInput)){
      this.smartlocation.editSmartLocation({indexEdit,userRules:userInput,userSelect});
      this.setState({
        edit:false
      });
      this.clear();
    }else{
      this.verifyAndChangeState('add-rule-input-error');
    }
  }

  exit(){
    this.setState({edit:false});
    this.clear();
  }

  verifyDomainPattern(domain){
    if (domain.length > 255) {
      return false;
    }
    const re = new RegExp(/^((?:(?:(?:\w[\.\-\+]?)*)\w)+)((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/);
    return domain.match(re);
  }

  verifyIfDomainExists(domain){
    const { userRules } = this.state;
    const foundDomain = userRules.filter(v=> v.userRules == domain);
    if(foundDomain.length > 0){
      return false;
    }
    return true;
  }

  clear(){
    this.setState({
      userInput: '',
      userSelect:'',
      userRules: this.smartlocation.getSmartLocationRules('smartLocationRules'),
    });
    this.reinitializedProxy();
  }

  createRemoveRule(rule) {
    return () => {
      if (!this.region) { return; }
      this.smartlocation.removeSmartLocation(rule);
      this.setState({ userRules: this.smartlocation.getSmartLocationRules('smartLocationRules') });
      this.reinitializedProxy();
    };
  }

  createEditRule(rule) {
    return () => {
      const { userRules } = this.state;
      this.onUserSelectChange({value:rule.proxy.id});
      this.reinitializedProxy();
      this.setState({
        indexEdit:userRules.findIndex(location => location.userRules == rule.userRules),
        userInput:rule.userRules,
        userSelect:rule.userSelect,
        edit:true,
        userRules: this.smartlocation.getSmartLocationRules('smartLocationRules') });
      };  
  }

  

  createBypassItem(rule) {
    if(rule.proxy){
      const { context: { theme } } = this.props;
      return (
        <SmartLocationItem
          key={rule.userRules}
          theme={theme}
          rule={rule}
          onRemoveItem={this.createRemoveRule(rule)}
          onEditItem={this.createEditRule(rule)}
        />
      );
      }
  }

  countryList(){
      const regionList = this.regionlist.getRegions();
      return Object.values(regionList).map(v=>{
        return {label:<div><img src={v.flag} height="20px" width="20px"/> {v.name} </div>,value:v.id}
      });;
  }

  countyLabel(label){
    if(label){
      return this.countryList().filter(v=>v.value == label);
    }
  }

  componentDidMount(){
    this.verifyDomains(); 
  }

  verifyInputs(){
    const { userInput,userSelect } = this.state;
    if(userInput && userSelect){
      return false
    }
    return true;
  }

  render() {
    const { context: { theme } } = this.props;
    let { edit,userInput,userSelect, userRules,checked,classNames } = this.state;
    const customStyles = {
      option: (provided, state) => ({
        ...provided,
        borderBottom: '2px dotted green',
        color: state.isSelected ? 'yellow' : 'black',
        backgroundColor: state.isSelected ? 'green' : 'white'
      }),
      control: (provided) => ({
        ...provided,
        marginTop: "5%",
      })
    }
    const lang = this.i18n.locale ? this.i18n.locale : 'en';

    return (
      <div className={`user-rules ${lang}`}>
        <div className="button-container">
            <h3 className="smart-location-h3">
            { t('SmartLocation') }
            </h3>
            <label className="switch">
                <input type="checkbox" checked={checked} onChange={() => this.setChecked(!checked)} ></input>
                <span className="slider round"></span>
            </label>
        </div>
        <div className={`add-container-smart-location`}>
          <h3 className="bl_sectionheader">
            { t('AddSmartLocation') }
          </h3>
          <Select   value={this.countyLabel(userSelect)} styles = { customStyles } onChange={this.onUserSelectChange} options={this.countryList()} className="mt-4 col-md-8 col-offset-4" isSearchable/>
          <div className="country-lists">
          <input
            type="text"
            name="rule"
            maxLength="32779"
            value={userInput}
            className={classNames.inputRule}
            placeholder="*.privateinternetaccess.com"
            disabled={!this.region}
            onChange={this.onUserInputChange}
          />
          <div className="buttons">

          { edit ?
          
          <div className="edit-delete">
          <button
            type="button"
            className="edit-btn-rule"
            disabled={this.verifyInputs()}
            onClick={this.edit}
          >
            <span></span>
          </button>
          <button
            type="button"
            className="delete-btn-rule"
            disabled={this.verifyInputs()}
            onClick={this.exit}
          >
            <p>
            x
            </p>
          </button>
          </div>
          :
          <button
          type="button"
          className="add-rule-btn"
          disabled={this.verifyInputs()}
          onClick={this.save}
        >
          <p>
            +
          </p>
        </button>
          }
          </div>
          </div>

        </div>
        <h3 className="bl_sectionheader">
          { t('WebAlreadyAdded') }
        </h3>
        <div className={`rule-list ${!this.region ? 'disabled' : ''} ${theme}`}>
          { userRules.map(this.createBypassItem) }
        </div>
      </div>
    );
  }
}

ManageLocations.propTypes = {
  context: PropTypes.object.isRequired,
};

export default withAppContext(ManageLocations);
