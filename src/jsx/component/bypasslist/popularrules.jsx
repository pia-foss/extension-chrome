import React from 'react';
import PropType from 'prop-types';

import PopularRule from 'component/bypasslist/popularrule';

const PopularRules = ({app}) => {
  const popularRulesByName = app.util.bypasslist.popularRulesByName();

  return (
    <div>
      <h3 className="bl_sectionheader">{t('PopularWebsites')}</h3>
      <div className="popular">
        {popularRulesByName.map((name) => {
          return <PopularRule defaultName={name} key={name} app={app} />;
        })}
      </div>
    </div>
  );
};

PopularRules.propTypes = {
  app: PropType.object.isRequired,
};

export default PopularRules;
