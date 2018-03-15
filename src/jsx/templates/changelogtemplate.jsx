import initPageTitle from 'component/pagetitle'
import tinyhttp from "tinyhttp"

export default function(renderer, app, window, document) {
  const React  = renderer.react,
        PageTitle = initPageTitle(renderer, app, window, document)
  return class ChangelogTemplate extends React.Component {
    constructor(props) {
      super(props)
    }

    componentDidMount() {
      const container = document.querySelector("#changelog"),
            url       = chrome.extension.getURL("html/CHANGELOG.html"),
            success   = (xhr) => {
              container.innerHTML = xhr.response
              const links = document.querySelectorAll("#changelog a")
              for(let i = 0; i < links.length; i++)
                links[i].addEventListener("click", (event) => chrome.tabs.create({url: event.target.getAttribute("href")}))
	    },
            error = (xhr) => container.innerHTML = "The changelog couldn't be loaded due to an error."
      tinyhttp().get(url).then(success).catch(error)
    }

    render() {
      return (
        <div id="changelog-template" className="row">
          <PageTitle text="CHANGELOG" previousTemplate="settings"/>
          <div id="changelog"></div>
        </div>
      )
    }
  }
}
