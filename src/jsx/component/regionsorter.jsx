export default function(renderer, app, window, document) {
  const React    = renderer.react,
        {storage} = app.util,
        documentClickListener = (event) => {
          const target = document.querySelector(".dropdown")
          if(target.classList.contains("open"))
            target.classList.remove("open")
        }

  return class extends React.Component {
    constructor(props) {
      super(props)
      this.state = {}
    }

    componentDidMount() {
      document.addEventListener('click', documentClickListener)
    }

    componentWillUnmount() {
      document.removeEventListener('click', documentClickListener)
    }

    changeSortBy(event) {
      switch(event.target.getAttribute('data-value')) {
        case "name":
          storage.setItem("sortby", "name")
          break
        case "latency":
          storage.setItem("sortby", "latency")
          break
      }
      renderer.renderTemplate("change_region")
    }

    toggleDropdown(event) {
      const target = document.querySelector(".dropdown")
      if(target.classList.contains("open"))
        target.classList.remove("open")
      else
        target.classList.add("open")
      event.nativeEvent.stopImmediatePropagation()
    }

    render() {
      const sortBy       = storage.getItem("sortby") || "name",
            sortByText   = t("SortBy"),
            translations = {"name": t("RegionName"), "latency": t("RegionLatency")}
      return (
        <div className="dropdown">
          <button onClick={this.toggleDropdown.bind(this)} className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
            {sortByText} {translations[sortBy]}
            <span className="caret"></span>
          </button>
          <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
            <li><a href="#" id="sort-by-name" data-value="name" onClick={this.changeSortBy.bind(this)}>{t("RegionName")}</a></li>
            <li><a href="#" id="sort-by-latency" data-value="latency" onClick={this.changeSortBy.bind(this)}>{t("RegionLatency")}</a></li>
          </ul>
        </div>
      )
    }
  }
}
