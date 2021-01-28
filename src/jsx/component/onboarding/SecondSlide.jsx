import React, { Component } from 'react';
import withAppContext from '@hoc/withAppContext';

class SecondSlide extends Component {
  constructor(props) {
    super(props);
    // properties
    this.props = props;
    this.app = props.context.app;
    this.state = {
        button: 1
    }

    this.chooseTheme = this.chooseTheme.bind(this);
    this.theme = this.props.context.getTheme();
    this.i18n = this.app.util.i18n;

    
    if(this.theme == 'dark'){
        this.state.button = 1;
    }else{
        this.state.button = 2;
    }
  }

  chooseTheme(theme){
    //change theme of the app
    const { context: { updateTheme } } = this.props;
   
    if(theme == 'dark'){
        updateTheme('dark');
        this.setState({button:1});
    }

    if(theme == 'white'){
        updateTheme('light');
        this.setState({button:2})
    }

  }

  render() {
    const {button}= this.state;
    //get theme for classes
    const theme = this.props.context.getTheme();
    const lang = this.i18n.locale ? this.i18n.locale : 'en';

    return (
        <div className={`second ${lang}`}>
            <div className={`top-disclaimers ${theme}`}>
                <p>{t("Step1")}</p>
                <h3>{t("ChooseTheme")}</h3>
            </div>
            <div class="middle-disclaimers">
                <span>
                    <p>
                        {t("PrivateInternetComesWith")}
                    </p>
                    <p>
                        {t("LightAndDarkDisclaimer")}
                    </p>
                    <p>
                        {t("LookOfBrowserDisclaimer")}
                    </p>
                </span>
            </div>
            <div class={`theme-buttons ${theme}`}>
                <button
                    type="button"
                    className="btn-dark"
                    onClick={() => {this.chooseTheme('dark')}}
                >
                    <span>
                        {t("DarkTheme")}
                    </span>
                    {button == 1 ? <span class="icon"><img src="../../images/icons/checkmark.png" alt="icon"/></span> : null}
                </button>
                <button
                    type="button"
                    className="btn-white"
                    onClick={() => {this.chooseTheme('white')}}
                >
                    <span>
                        {t("WhiteTheme")}
                    </span>
                    {button == 2 ? <span class="icon"><img src="../../images/icons/checkmark.png" alt="icon"/></span> : null}
                </button>
            </div>
        </div>
    );
  }
}

export default withAppContext(SecondSlide);
