require_relative 'setup'
RSpec.describe 'Change region page aka "Region index" page', type: :feature do
  describe "Flag replacement" do
    describe "AU flag" do
      let(:flag) do
        File.join Dir.getwd, "builds",  ENV["build"], "images", "flags", "AU_64.png"
      end

      let(:replacement) do
        'https://www.privateinternetaccess.com/images/flags/au_3x.png'
      end

      before do
        FileUtils.mv flag, "#{flag}-TMP"
      end

      after do
        FileUtils.mv "#{flag}-TMP", flag
      end

      specify 'broken flag image is replaced by flag from website (list view)' do
        visit popup_path
        login_successfully
        click_on_current_region
        expect(page).to have_selector("img[src='#{replacement}']")
      end

      specify 'broken flag image is replaced by flag from website (grid view)' do
        visit popup_path
        login_successfully
        click_on_current_region
        click_grid_view_icon
        expect(page).to have_selector("img[src='#{replacement}']")
      end
    end
  end

  describe "Grid view" do
    before do
      visit popup_path
      login_successfully
      click_on_current_region
      click_grid_view_icon
    end

    specify 'click of grid view icon renders grid view' do
      expect(page).to have_css('#region-grid')
    end

    specify 'click of list view icon returns to list view' do
      click_list_view_icon
      expect(page).to have_css('#region-list')
    end

    specify 'click of region connects then renders authenticated page' do
      choose_region_in_grid 'aus_melbourne'
      expect(page).to have_content(t("aus_melbourne"))
      expect(find('.switch')).to be_checked
    end

    specify 'grid view is remembered as default' do
      click_back_button
      click_on_current_region
      expect(page).to have_css('#region-grid')
    end
  end

  describe "List view" do
    before do
      visit popup_path
      login_successfully
      click_on_current_region
    end

    specify 'it is the default view' do
      expect(page).to have_css('#region-list')
    end

    specify 'click of region connects then renders authenticated page' do
      click_on t("aus_melbourne")
      expect(page).to have_content(t("aus_melbourne"))
      expect(find('.switch')).to be_checked
    end

    describe "Sort by" do
      let(:sortby_name) { "#{t('SortBy')} #{t('SortByName')}" }
      let(:sortby_latency) { "#{t('SortBy')} #{t('RegionLatency')}" }

      specify 'sort by name is default' do
        expect(page).to have_content(sortby_name)
      end

      specify 'sort by latency becomes default' do
        click_on sortby_name
        click_on t("RegionLatency")
        click_back_button
        click_on_current_region
        expect(page).to have_selector(".dropdown-toggle", text: sortby_latency)
      end

      specify 'sorting by latency includes ping time of regions' do
        click_on sortby_name
        click_on t("RegionLatency")
        expect(page).to have_selector('.list-item-latency', text: /^\d{1,4}ms$/, wait: 10)
      end
    end
  end
end
