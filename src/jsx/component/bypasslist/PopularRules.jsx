import React from 'react';
import PropTypes from 'prop-types';

import PopularRule from '@component/bypasslist/PopularRule';

const PopularRules = ({ popularRules }) => {
  return (
    <div>
      <h3 className="bl_sectionheader">
        { t('PopularWebsites') }
      </h3>

      <div className="popular">
        {
          popularRules.map((name) => {
            return <PopularRule defaultName={name} key={name} />;
          })
        }
      </div>
    </div>
  );
};

PopularRules.propTypes = {
  popularRules: PropTypes.array.isRequired,
};

export default PopularRules;
