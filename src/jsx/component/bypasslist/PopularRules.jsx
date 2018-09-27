import React from 'react';
import PropType from 'prop-types';
import PopularRule from 'component/bypasslist/PopularRule';

const PopularRules = ({ popularRules }) => {
  return (
    <div>
      <h3 className="bl_sectionheader">
        { t('PopularWebsites') }
      </h3>

      <div className="popular">
        <div>
          {
            popularRules.map((name) => {
              return <PopularRule defaultName={name} key={name} />;
            })
          }
        </div>
      </div>
    </div>
  );
};

PopularRules.propTypes = {
  popularRules: PropType.array.isRequired,
};

export default PopularRules;
