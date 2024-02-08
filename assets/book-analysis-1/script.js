let d3wc_cloud;

let table = (data, options) => {
    options = Object.assign({}, tableDefaultOptions, options);
    const { sortable, rank, paged } = options;
    let sortKey = undefined;
    let sortDirection = true;
    let page = 0;
    if (sortable && rank) {
        throw new Error("A table can either be ranked or sortable, but not both");
    }
    let columns = Object.keys(data[0]).map(key => {
        const opts = options.columns[key] || {};
        return {
            key: key,
            type: opts.type || typeof data[0][key],
            options: opts
        };
    });

    function bake() {
        if (sortKey) {
            data = data.slice().sort((a, b) => {
                let as = a[sortKey];
                let bs = b[sortKey];
                // make this sort stable
                if (as == bs) return JSON.stringify(a).localeCompare(JSON.stringify(b));
                let res = as > bs ? 1 : as < bs ? -1 : 0;
                if (sortDirection) res = -res;
                return res;
            });
        }
        let offset = page * paged;
        let rows = data.slice(offset, offset + (paged || data.length));
        let pages = paged ? Math.ceil(data.length / paged) : 1;
        
        function createStyles() {
            return `
                <style>
                .pretty-pager {
                    padding-top: 1rem;
                }
                .pretty-pager button {
                    cursor: pointer;
                    border-radius: 3px;
                    border: 1px solid #fff;
                    font-size: inherit;
                }
                .pretty-pager button:hover {
                    border: 1px solid #888;
                }
                .pretty-table.normal {
                    font-size: 15px;
                }
                .pretty-table.normal th,
                .pretty-table.normal td {
                    padding: 3px 2px;
                }
                .pretty-table th,
                .pretty-table td {
                    vertical-align: top;
                }
                .pretty-table thead th {
                    text-transform: uppercase;
                    font-weight:500;
                }
                .pretty-table thead th.column-type-number string {
                    order: 1;
                }
                .pretty-table th.sortable {
                    cursor: pointer;
                }
                .pretty-table thead th.column-type-number,
                .pretty-table tbody td.cell-type-number,
                .pretty-table tbody td.cell-rank {
                    text-align:right;
                }
                .pretty-table tbody td.cell-type-number,
                .pretty-table tbody td.cell-rank {
                    font-family: menlo,consolas,monaco,monospace;
                    font-size: 90%;
                }
                .pretty-table tbody td.cell-rank {
                    padding-right: 1em;
                    color: #666;
                }

                .pretty-table tr {
                    background-color: white !important;
                }
                .pretty-table td {
                    border: none;
                    color: #444;
                }

                .pretty-table tr:not(:last-child) {
                    border-bottom: solid 1px #eee;
                }

                .pretty-table {
                    border: none;
                }

                .pretty-table th {
                    background-color: white;
                    border: none;
                    color: #111;
                }

                .pretty-table-con {
                    width: 640px
                }                                  
                </style>
            `;
        }
        
        function createTableHeader(rank, columns, sortKey, sortDirection, sortable) {
            const headerColumns = columns.map(c => th(c, sortKey, sortDirection, sortable)).join('');
            return rank ? `<th></th>${headerColumns}` : headerColumns;
        }
        
        function createTableBody(rows, rank, columns, offset) {
            return rows.map((row, i) => {
                const rankCell = rank ? `<td class='cell-rank'>${offset + i + 1}</td>` : "";
                const dataCells = columns.map(c => {
                    const displayValue = (c.options.formatter || identity)(row[c.key], i, row);
                    const cellContent = displayValue instanceof window.HTMLElement && displayValue.tagName === "TD"
                        ? displayValue.outerHTML
                        : `<td class='cell-type-${c.type}'>${displayValue}</td>`;
                    return cellContent;
                }).join('');
                return `<tr>${rankCell}${dataCells}</tr>`;
            }).join('');
        }
        
        function createPager(pages) {
            const buttons = Array.from({ length: pages }, (_, i) => `<button data-page="${i}">${i + 1}</button>`).join('');
            return `<div class='pretty-pager'><button data-action="previous">Previous</button>${buttons}<button data-action="next">Next</button></div>`;
        }
        
        function createTable(options, rank, columns, sortKey, sortDirection, sortable, rows, offset, pages) {
            const header = options.header === false ? '' : `<thead>${createTableHeader(rank, columns, sortKey, sortDirection, sortable)}</thead>`;
            const body = `<tbody>${createTableBody(rows, rank, columns, offset)}</tbody>`;
            const pager = pages > 1 ? createPager(pages) : '';
            const styles = createStyles();
        
            return $(`<div class='pretty-table-con'>${styles}<table class='pretty-table ${options.style}'>${header}${body}</table>${pager}</div>`)[0];
        }
        
        return createTable(options, rank, columns, sortKey, sortDirection, sortable, rows, offset, pages);
        
    }

    let dom = bake();

    function rerender() {
        dom.firstChild.remove();
        dom.appendChild(bake().firstChild);
    }

    dom.addEventListener("click", e => {
        if (e.target.tagName === "TH" && sortable) {
            if (sortKey == e.target.dataset.key) {
                sortDirection = !sortDirection;
            }
            sortKey = e.target.dataset.key;
            rerender();
        }
        if (e.target.tagName === "BUTTON") {
            if (e.target.dataset.action) {
                switch (e.target.dataset.action) {
                    case "next":
                        page++, rerender();
                        break;
                    case "previous":
                        page--, rerender();
                        break;
                }
            } else if (e.target.dataset.page) {
                (page = parseInt(e.target.dataset.page)), rerender();
            }
        }
    });

    return dom;
}

function humanFormatNumber(num, decimalPlaces = 1) {
    // Function to format the number based on whether it's an integer or not
    function format(value, divisor, suffix) {
        let result = value / divisor;
        // Check if the result is an integer
        if (result % 1 === 0) {
            return result + suffix;
        } else {
            return result.toFixed(decimalPlaces) + suffix;
        }
    }

    // Check if the number is less than a thousand
    if (num < 1000) {
        return num.toString();
    }
    // Format for thousands
    else if (num < 1000000) {
        return format(num, 1000, "K");
    }
    // Format for millions
    else if (num < 1000000000) {
        return format(num, 1000000, "M");
    }
    // Format for billions
    else {
        return format(num, 1000000000, "B");
    }
}



const tableDefaultOptions = ({ columns: {}, style: 'normal', paged: 25 });
const identity = i => i;
let th = (c, sortKey, sortDirection, sortable) => {
    let {
        options: { title }
    } = c;
    let sortIndicator = sortKey && sortDirection ? "↑" : "↓";
    let arrow = `<span style='${sortKey === c.key ? "" : "visibility:hidden"
        }'>${sortIndicator}</span>`;
    let displayedTitle = title !== undefined ? title : c.key;
    return c.type === "number"
        ? `<th
                data-key="${c.key}"
                class='column-type-${c.type} ${sortable ? "sortable" : ""}'>
                  ${arrow}${displayedTitle}
              </th>`
        : `<th
                data-key="${c.key}"
                class='column-type-${c.type} ${sortable ? "sortable" : ""}'>
                  ${displayedTitle}${arrow}
              </th>`;
}


// function generateLogScaleArray(maxPower) {
//     let array = [0];

//     for (let power = 0; power < maxPower; power++) {
//         // Note the change here
//         let base = Math.pow(10, power);
//         for (let i = 1; i < 10; i++) {
//             let value = base * i;
//             array.push(value);
//         }
//     }

//     array.push(Math.pow(10, maxPower)); // Add the final value
//     console.log("array",array);
//     return array;
// }

function generateLogScaleArray(maxVal) {
    let array = [0];
    
    // Start from the smallest power of 10 that is less than or equal to maxVal
    let maxPower = Math.floor(Math.log10(maxVal));
    
    for (let power = 0; power <= maxPower; power++) {
        let base = Math.pow(10, power);
        for (let i = 1; i < 10; i++) {
            let value = base * i;
            if (value > maxVal) {
                // Stop if value exceeds maxVal, and ensure the array ends with a value just above maxVal
                if (Math.pow(10, power) !== maxVal) { // Check if maxVal is not a power of 10
                    array.push(value);
                }
                return array;
            }
            array.push(value);
        }
    }

    // Handle case where maxVal is exactly a power of 10
    if (Math.pow(10, maxPower) === maxVal) {
        array.push(maxVal);
    }

    return array;
}

const wrapperXPadding = d3
    .select(".wrapper")
    .style("padding-left")
    .slice(0, -2);


let processData = function (event) {
    var screenWidth = window.screen.width;
    var deviceType;
    if (screenWidth <= 600) {
        deviceType = "mobile";
    } else if (screenWidth <= 991) {
        deviceType = "tablet";
    } else {
        deviceType = "desktop";
    }

    var chartWidth = 800;
    if (deviceType != "desktop") {
        chartWidth = screenWidth - 2 * wrapperXPadding;
    }

    // ---------------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------------

    let createBarChart = (fileName, chartId, metric) => {
        d3.json(`/assets/book-analysis-1/data/${fileName}.json`)
            .then(function (data) {
                data = data.filter((d) => d.type == bookTypeFilter);
                // console.log(data);
                const labelWidth = deviceType == "desktop" ? 800 : screenWidth;
                const imgWidth = deviceType == "desktop" ? 42 : 42,
                    imgHeight = deviceType == "desktop" ? 64 : 64;
                const height = 600;
                const imgMargin = 5,
                    labelMargin = 5,
                    barMargin = 5,
                    barPadding = 5,
                    barConMargin = 5;
                const barWidth = chartWidth - imgWidth - imgMargin - barMargin,
                    barHeight = 30;

                data = data.slice(0, 10);

                const x = d3
                    .scaleLinear()
                    .domain([0, d3.max(data, (d) => parseInt(d[metric]))])
                    .range([0, barWidth]);

                const chart = d3.select("#" + chartId);

                const t = chart.transition().duration(750);

                const bars = chart
                    .selectAll("div.bar-con")
                    .data(data, (d) => d.id)
                    // .join("div")
                    // .attr("class", "bar-con")
                    

                    .join(
                        enter => enterFunc(enter),
                        update => updateFunc(update),
                        exit => exitFunc(exit)
                    )
                    ;


                function enterFunc(enter) {
                    // console.log("enter xxz", enter);
                    return enter.append("div")
                        .attr("class", "bar-con")
                        .style("transform", "translateX(-300px)")
                        .style("opacity", 0)
                        .call(enter => enter
                            .append("div")
                            .attr("class", "img-bar-con")
                            .call(imgBarCon => imgBarCon
                                .append("div")
                                .append("a")
                                .attr("href", (d) => "https://www.goodreads.com/book/show/" + d.id)
                                .attr("target", "_blank")
                                .attr("class", "bar-link")
                                .append("div")
                                .attr("class", "img-con")
                                .style("width", imgWidth + "px")
                                .style("height", imgHeight + "px")
                                .style("background-image", (d) => `url("${d.image_url}")`)
                                .style("margin-right", imgMargin + "px")
                            )
                            .append("div")
                            .attr("class", "rect-con")
                            .style("width", (d) => x(d[metric]) + "px")
                            .style("height", barHeight + "px")
                            .style("margin-left", barMargin + "px")

                            .append("span")
                            .attr("class", "bar-text")
                            .html((d) =>
                                deviceType == "desktop"
                                    ? d3.format(",")(d[metric])
                                    : humanFormatNumber(d[metric])
                            )
                    )
                    .call(enter => enter
                        .append("div")
                        .attr("class", "bar-label-con")
                        .html(function (d) {
                            return d.title;
                        })
                    )
                    .call(enter => enter
                        .transition(t).delay((d, i) => 150 + i * 50)
                        .style("transform", "translateX(0px)").style("opacity", 1)
                    )
                }

                function updateFunc(update) {
                    return update
                    // .call(update => update
                    // // .selectAll("div.bar-con")
                    // .style("transform", "translateX(-300px)")
                    //     .style("opacity", 0)
                    //     .call(rects => rects.transition().duration(3000).style("transform", "translateX(0px)")).style("opacity", 1)
                    // )
                }

                function exitFunc(exit) {
                    // console.log("exit xxz", exit);
                    exit
                    .style("position", "absolute")
                    .call(exit => exit
                    .transition(t)
                    .delay((d, i) => i * 50)
                    .style("transform", "translateX(-300px)")
                    .style("opacity", 0).remove());
                }


                // const imgBarCon = bars
                //     .append("div")
                //     .attr("class", "img-bar-con");

                // imgBarCon
                //     .append("div")
                //     .append("a")
                //     .attr(
                //         "href",
                //         (d) => "https://www.goodreads.com/book/show/" + d.id
                //     )
                //     .attr("target", "_blank")
                //     .attr("class", "bar-link")
                //     .append("div")
                //     .attr("class", "img-con")
                //     .style("width", imgWidth + "px")
                //     .style("height", imgHeight + "px")
                //     .style("background-image", (d) => `url("${d.image_url}")`)
                //     .style("margin-right", imgMargin + "px");

                // const barRects = imgBarCon
                //     .append("div")
                //     .attr("class", "rect-con")
                //     .style("width", 0)
                //     .style("height", barHeight + "px")
                //     .style("margin-left", barMargin + "px");

                // bars.append("div")
                //     .attr("class", "bar-label-con")
                //     .html(function (d) {
                //         return d.title;
                //     });
                // // .style("height", "30px")
                // // .style("width", labelWidth + "px")

                let barTooltip = d3
                    .select("body")
                    .append("div")
                    .attr("class", "bar-tooltip")
                    .style("opacity", 0);

                let showTooltipFunc = function (event, d) {
                    // if (event.target.className == "bar-con") return;
                    // barTooltip.style("opacity", 0);
                    barTooltip.html(
                        `${d.title} <br> By ${d.author_name} <br> ${d3.format(
                            ","
                        )(d[metric])} ratings`
                    );
                    barTooltip
                        .transition()
                        .duration(200)
                        .ease(d3.easePoly.exponent(2))
                        .style("opacity", 1)
                        .style(
                            "left",
                            (deviceType == "desktop" ? event.pageX : 80) + "px"
                        )
                        .style("top", event.pageY - 28 + "px");
                };

                let hideTooltipFunc = function (event, d) {
                    barTooltip.transition().duration(100).style("opacity", 0);
                };

                const barRects = d3.selectAll(".rect-con");
                barRects
                    .on("mouseover", showTooltipFunc)
                    .on("touchstart", showTooltipFunc)
                    .on("mouseout", hideTooltipFunc)
                    .on("touchend", hideTooltipFunc);

                // barRects
                //     .transition()
                //     .duration(300)
                //     .delay((d, i) => i * 50)
                //     .style("width", (d) => x(d[metric]) + "px");

                // barRects
                //     .append("span")
                //     .attr("class", "bar-text")
                //     .html((d) =>
                //         deviceType == "desktop"
                //             ? d3.format(",")(d[metric])
                //             : humanFormatNumber(d[metric])
                //     );
            })
            .catch(function (error) {
                console.error("Error loading the CSV file:", error);
            });
    };




    let createBarChart_2 = (data1, data2, chartId, metric, categoryField, tooltipLabel, tooltipWorkTitle='Most popular works') => {
        const width = 1200;
        const height = 700;
        const margin = { top: 20, right: 120, bottom: 20, left: 250 };
        const svg = d3.select("#" + chartId)
            .selectAll("svg")
            .data([true])
            .join("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

        const svg_g = svg.selectAll('g.svg_g')
            .data([true])
            .join('g')
            .attr("transform", `translate(0, 0)`)
            .attr("class", "svg_g");
        
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(data1, d => d[metric])])
            .range([margin.left, width - margin.right - margin.left]);

        const yScale = d3.scaleBand()
            .domain(data1.map(d => d[categoryField]))
            .range([0, height - margin.top - margin.bottom]) // xx
            .padding(0.1);

        const t = svg_g.transition().duration(3000);
        const bars = svg_g.selectAll("rect.bar")
            .data(data1, d => d[categoryField])
            .join(
                enter => enter
                    // .call(enter => enter
                    // .append("line")
                    // .attr("x1", xScale(0))
                    // .attr("x2", d => xScale(0) + xScale(d[metric]))
                    // .attr("y1", d => yScale(d[categoryField]))
                    // .attr("y2", d => yScale(d[categoryField]))
                    // .attr("stroke", "steelblue")
                    // .attr("stroke-width", 2)
                    // .attr("class", "bar")
                    // .style("opacity", 0)
                    // .transition(t)
                    // .style("opacity", 1))
                    // .append("circle")
                    // .attr("fill", d => d3.schemeSet1[d.value > 0 ? 1 : 0])
                    // .attr("cx", d => xScale(0) + xScale(d[metric]))
                    // .attr("cy", d => yScale(d[categoryField]))
                    // .attr("r", 6), // xx use separate enter and update

                    .append("rect")
                    .attr("class", "bar")
                    .attr("rx", 5)
                    .attr("ry", 5)
                    .attr("x", d => (Math.random() < 0.5 ? -1 : 1) * Math.random() * width)
                    .attr("y", d => (Math.random() < 0.5 ? -1 : 1) * Math.random() * height)
                    .style("opacity", 0)
                    .transition(t)
                    .style("opacity", 1)
                    .attr("x", xScale(0))
                    .attr("y", d => yScale(d[categoryField]))
                    .attr("width", d => xScale(d[metric]))
                    .attr("height", yScale.bandwidth()),
                update => update
                    .attr("x", xScale(0))
                    .transition(t)
                    .attr("y", d => yScale(d[categoryField]))
                    .attr("width", d => xScale(d[metric]))
                    .attr("height", yScale.bandwidth()),
                exit => exit
                    .style("position", "absolute")
                    .call(exit => exit
                        .transition(t)
                        // .delay((d, i) => i * 50)
                        // move to random position
                        .attr("x", d => (Math.random() < 0.5 ? -1 : 1) * Math.random() * width)
                        .attr("y", d => (Math.random() < 0.5 ? -1 : 1) * Math.random() * height)
                        // .style("transform", "tra")
                        .style("opacity", 0).remove())
            )
            ;
            // .attr("fill", "steelblue");
        
        svg_g.selectAll("text.label-count")
            .data(data1, d => d[categoryField])
            .join(
                enter => enter
                    .append("text")
                    .attr("class", "label-count")
                    .attr("dy", "0.35em")
                    .text(d => d3.format(',')(d[metric]))
                    .style("opacity", 0)
                    .attr("x", d => (Math.random() < 0.5 ? -1 : 1) * Math.random() * width)
                    .attr("y", d => (Math.random() < 0.5 ? -1 : 1) * Math.random() * height)
                    .transition(t)
                    .attr("x", d => xScale(0) + xScale(d[metric]) + 5)
                    .attr("y", d => yScale(d[categoryField]) + yScale.bandwidth() / 2)
                    .style("opacity", 1),
                update => update
                    .style("opacity", 0)
                    .transition(t)
                    .style("opacity", 1)
                    .text(d => d3.format(',')(d[metric]))
                    .attr("x", d => xScale(0) + xScale(d[metric]) + 5)
                    .attr("y", d => yScale(d[categoryField]) + yScale.bandwidth() / 2),
                exit => exit
                    .style("position", "absolute")
                    .call(exit => exit
                        .transition(t)
                        .attr("x", d => (Math.random() < 0.5 ? -1 : 1) * Math.random() * width)
                        .attr("y", d => (Math.random() < 0.5 ? -1 : 1) * Math.random() * height)
                        .style("opacity", 0).remove())
            );
        
        svg_g.selectAll("text.label-name")
            .data(data1, d => d[categoryField])
            .join(
                enter => enter
                    .append("text")
                    .attr("class", "label-name")
                    .attr("dy", "0.35em")
                    .text(d => d[categoryField])
                    .attr("text-anchor", "end")
                    .style("opacity", 0)
                    .attr("x", d => (Math.random() < 0.5 ? -1 : 1) * Math.random() * width)
                    .attr("y", d => (Math.random() < 0.5 ? -1 : 1) * Math.random() * height)
                    .transition(t)
                    .attr("x", d => xScale(0) - 5)
                    .attr("y", d => yScale(d[categoryField]) + yScale.bandwidth() / 2)
                    .style("opacity", 1),
                update => update
                    .transition(t)
                    .attr("x", d => xScale(0) - 5)
                    .attr("y", d => yScale(d[categoryField]) + yScale.bandwidth() / 2),
                exit => exit
                    .style("position", "absolute")
                    .call(exit => exit
                        .transition(t)
                        .attr("x", d => (Math.random() < 0.5 ? -1 : 1) * Math.random() * width)
                        .attr("y", d => (Math.random() < 0.5 ? -1 : 1) * Math.random() * height)
                        .style("opacity", 0).remove())
            );



        const tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "author-top-works-tooltip") // xx same class for all tooltipl??!!
            .style("opacity", 0);

        let showTooltipFunc = function (event, d) {
            let top_works = data2.filter((d2) => d2[categoryField] == d[categoryField]);
            tooltip.html(
                `
                <strong>${d[categoryField]}</strong> <br>
                ${d3.format(",")(d[metric])} ${tooltipLabel} <br>
                <hr>
                <strong>${tooltipWorkTitle}</strong> <br>
                ${top_works.map(d => `<div class='a-top-work'><div><img src=${d.image_url} /></div> 
                    <div><p>${d.title}</p><p>${d3.format(",")(d.ratings_count)} ratings</p></div></div>`).join("<br>")}
                `
            );
            tooltip
                .transition()
                .duration(200)
                .ease(d3.easePoly.exponent(1))
                .style("opacity", 1)
                .style(
                    "left",
                    (deviceType == "desktop" ? event.pageX : 80) + "px"
                )
                .style("top", event.pageY - 28 + "px");
        };

        let hideTooltipFunc = function (event, d) {
            tooltip.transition().duration(100).style("opacity", 0);
        };
        bars.on("mouseover", showTooltipFunc);
        bars.on("mouseout", hideTooltipFunc);
    } 



    let chartFuncs = {}
    const viewportHeight = window.innerHeight;

    function callback(entries, observer) {
        entries.forEach((entry) => {
        if(entry.isIntersecting) {
            chartFuncs[entry.target.id]();
        } else {
        }
        });
    }

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px 0px 0px',
        threshold: 0.01
    };
    const observer = new IntersectionObserver(callback, observerOptions);

    function mostReviewedBooksFunc() {
        createBarChart(
            "most_reviewed_books",
            "most-reviewed-books-chart",
            "text_reviews_count"
        );
    }

    chartFuncs["most-reviewed-books-chart"] = mostReviewedBooksFunc;
    observer.observe(document.getElementById("most-reviewed-books-chart"));

    // createBarChart(
    //     "most_rated_books",
    //     "most-rated-books-chart",
    //     "ratings_count"
    // );





    // // ---------------------------------------------------------------------------------------------------------------
    // // ---------------------------------------------------------------------------------------------------------------
    // // ---------------------------------------------------------------------------------------------------------------

    // d3.json("/assets/book-analysis-1/data/books_55_rating.json")
    //     .then(function (data) {
    //         const val = data[bookTypeFilter];
    //         $("#num_55_rating").html(d3.format(",")(val));
    //     })
    //     .catch(function (error) {
    //         console.error("Error loading the CSV file:", error);
    //     });

    // // ---------------------------------------------------------------------------------------------------------------
    // // ---------------------------------------------------------------------------------------------------------------
    // // ---------------------------------------------------------------------------------------------------------------

    // d3.json("/assets/book-analysis-1/data/ratings_count_hists.json")
    //     .then(function (data) {
    //         data = data[bookTypeFilter];
    //         const inset = 1;
    //         const marginTop = 20; // top margin, in pixels
    //         const marginRight = 20; // right margin, in pixels
    //         const marginBottom = 40; // bottom margin, in pixels
    //         const marginLeft = 40; // left margin, in pixels
    //         const width = 800; // outer width of chart, in pixels
    //         const height = 500; // outer height of chart, in pixels

    //         // const thresholds = data["bin_edges"];

    //         // let bins = thresholds
    //         //     .map((currentValue, index, array) => {
    //         //         if (index < array.length - 1) {
    //         //             return { x0: currentValue, x1: array[index + 1] };
    //         //         }
    //         //     })
    //         //     .filter(Boolean); // This filter removes the undefined value from the last iteration

    //         // const Y = data["frequencies"]; // .map(value => value == 0 ? 0.001 : value)

    //         const xScale = d3.scaleLinear(
    //             [0, d3.max(data.map((d) => d.x1))],
    //             [marginLeft, width - marginRight]
    //         );
    //         const yScale = d3
    //             .scaleSymlog(
    //                 [0, d3.max(data.map((d) => d.freq))],
    //                 [height - marginBottom, marginTop]
    //             )
    //             .constant(1)
    //             .clamp(true)
    //             .nice();

    //         const svg = d3
    //             .select("#ratings-hist-chart")
    //             .selectAll("svg")
    //             .data([true])
    //             .join("svg")

    //             // .append("svg")
    //             .attr("width", width)
    //             .attr("height", height)
    //             .attr("viewBox", [0, 0, width, height])
    //             .attr(
    //                 "style",
    //                 "max-width: 100%; height: auto; height: intrinsic;"
    //             );

    //         // svg.append("linearGradient")
    //         //     .attr("id", "area-gradient")
    //         //     .attr("gradientUnits", "userSpaceOnUse")
    //         //     .attr("x1", "100%")
    //         //     .attr("y1", "0%")
    //         //     .attr("x2", "0%")
    //         //     .attr("y2", "0%")
    //         //     .selectAll("stop")
    //         //     .data([
    //         //         { offset: "0%", color: "navy" },
    //         //         // add additional steps as needed for gradient.
    //         //         { offset: "95%", color: "transparent" },
    //         //     ])
    //         //     .enter()
    //         //     .append("stop")
    //         //     .attr("offset", function (d) {
    //         //         return d.offset;
    //         //     })
    //         //     .attr("stop-color", function (d) {
    //         //         return d.color;
    //         //     });
            
    //         const g = svg
    //                 .selectAll("g.histogram")
    //                 .data([true])
    //                 .join("g")
    //                 .attr("class", "histogram");

    //         let rects = g
    //             // .attr("fill", "url(#area-gradient)")
    //             .attr("fill", "steelblue")
    //             .selectAll("rect")
    //             .data(data)
    //             .join("rect")
    //             // .attr("fill", "linear-gradient(180deg, #fff, #ddd)")
    //             .attr("x", (d) => xScale(d.x0) + inset)
    //             .attr("width", (d) =>
    //                 Math.max(0, xScale(d.x1) - xScale(d.x0) - inset)
    //             )
    //             .attr("y", (d, i) => yScale(d.freq))
    //             .attr("height", (d, i) => yScale(0) - yScale(d.freq));

    //         let histTooltip = d3
    //             .select("body")
    //             .append("div")
    //             .attr("class", "hist-tooltip")
    //             .style("opacity", 0);

    //         let showTooltipFunc = function (event, d) {
    //             histTooltip.html(
    //                 `<strong>${humanFormatNumber(
    //                     d.x0,
    //                     2
    //                 )} - ${humanFormatNumber(d.x1, 2)}</strong> ratings <br> 
    //                 ${d3.format(",")(d.freq)} books`
    //             );
    //             histTooltip
    //                 .transition()
    //                 .duration(200)
    //                 .ease(d3.easePoly.exponent(1))
    //                 .style("opacity", 1)
    //                 .style(
    //                     "left",
    //                     (deviceType == "desktop" ? event.pageX : 80) + "px"
    //                 )
    //                 .style("top", event.pageY - 28 + "px");
    //         };

    //         let hideTooltipFunc = function (event, d) {
    //             histTooltip.transition().duration(100).style("opacity", 0);
    //         };

    //         rects
    //             .on("mouseover", showTooltipFunc)
    //             .on("touchstart", showTooltipFunc)
    //             .on("mouseout", hideTooltipFunc)
    //             .on("touchend", hideTooltipFunc);

    //         let xAxg = g
    //             .selectAll("g.x-axis")
    //             .data([true])
    //             .join("g")
    //             .attr("class", "x-axis");

    //         xAxg
    //             .attr("transform", `translate(0,${height - marginBottom})`)
    //             .call((g) =>
    //                 g
    //                     .append("text")
    //                     .attr("x", width)
    //                     .attr("y", marginBottom - 4)
    //                     .attr("fill", "currentColor")
    //                     .attr("text-anchor", "end")
    //                     .text("Rating count →")
    //             )
    //             .transition()
    //             .duration(750)
    //             .call(
    //                 d3
    //                     .axisBottom(xScale)
    //                     .ticks(10)
    //                     .tickFormat((d) => humanFormatNumber(d))
    //                     .tickSizeOuter(0)
    //             );
                

    //         let yAxg = g
    //             .selectAll("g.y-axis")
    //             .data([true])
    //             .join("g")
    //             .attr("class", "y-axis");

    //         const yTickValues = generateLogScaleArray(yScale.domain()[1]);

    //         // Add the y-axis and label, and remove the domain line.
    //         yAxg
    //             .attr("transform", `translate(${marginLeft},0)`)
    //             .call((g) => g.select(".domain").remove())
    //             .call((g) =>
    //                 g
    //                     .append("text")
    //                     .attr("x", -marginLeft)
    //                     .attr("y", 10)
    //                     .attr("fill", "currentColor")
    //                     .attr("text-anchor", "start")
    //                     .text("↑ Frequency (no. of books)")
    //             )
    //             .transition()
    //             .duration(750)
    //             .call(
    //                 d3
    //                     .axisLeft(yScale)
    //                     // .ticks(-10)
    //                     .tickValues(yTickValues)
    //                     // .tickValues()
    //                     .tickFormat((d) =>
    //                     // console.log("yTickValues", yTickValues, "Math.max(yTickValues)", Math.max(yTickValues), d, Math.log10(d) % 1 === 0, d == Math.max(yTickValues), (Math.log10(d) % 1 === 0) || (d == Math.max(yTickValues)))
    //                         (Math.log10(d) % 1 === 0) || (d == Math.max(...yTickValues)) ? humanFormatNumber(d) : ""
    //                     )
    //                     .tickSizeOuter(0)
    //             );
    //     })
    //     .catch(function (error) {
    //         console.error("Error loading the CSV file:", error);
    //     });

    // // ---------------------------------------------------------------------------------------------------------------
    // // ---------------------------------------------------------------------------------------------------------------
    // // ---------------------------------------------------------------------------------------------------------------
    
    // function topRatedBooksFunc() {
    //     Promise.all([
    //         d3.json("/assets/book-analysis-1/data/top_rated_books.json"),
    //         d3.json("/assets/book-analysis-1/data/top_5_star_perc.json")
    //     ]).then(function ([data_1, data_2]) {
    //         const data = data_2.filter((d) => d.type == bookTypeFilter);
    //         const data_choice = 2;
    //         const data_field = '5_star_percent';

    //         const width = 1200;
    //         const height = 700;
    //         const margin = { top: 20, right: 30, bottom: 20, left: 75 };

    //         const circleFill = "#ECECEC00";
    //         const highlightFill = "#FF590C";
    //         const strokeColor = "#000000";
    //         const strokeWidth = 1;
    //         const imgWidth = 39.2;
    //         const imgHeight = 60.8;
    //         const radius = Math.sqrt(
    //             Math.pow(imgHeight / 2, 2) + Math.pow(imgWidth / 2, 2)
    //         );
    //         const highlightRadius = radius * 1.5;
    //         const imgMultiple = 1.3;
    //         const highlightStrokeWidth = 7;

    //         const svg = d3
    //             .select("#top-rated-books-chart")
    //             .selectAll("svg")
    //             .data([true])
    //             .join("svg")
    //             .attr("width", width)
    //             .attr("height", height)
    //             .attr("viewBox", [0, 0, width, height])
    //             .attr(
    //                 "style",
    //                 "max-width: 100%; height: auto; height: intrinsic;"
    //             );

    //         const defs = svg.selectAll("defs")
    //             .data([true])
    //             .join(
    //                 enter => enter
    //                     .append("defs")
    //                     .append("marker")
    //                     .attr("id", "arrowhead-right")
    //                     .attr("refX", 0)
    //                     .attr("refY", 5)
    //                     .attr("markerWidth", 16)
    //                     .attr("markerHeight", 13)
    //                     .append("path")
    //                     .attr("d", "M 0 0 L 5 5 L 0 10")
    //                     .attr("stroke", "black")
    //                     .attr("stroke-width", 1)
    //                     .attr("fill", "#000000"),
    //                 update => update,
    //             );

    //         const svg_g = svg
    //             .selectAll("g.svg_g")
    //             .data([true])
    //             .join("g")
    //             .attr("transform", `translate(${margin.left}, ${margin.top})`)
    //             .attr("class", "svg_g");

    //         const xMin = d3.min(data, (d) => d[data_field]);
    //         const xMax = d3.max(data, (d) => d[data_field]);
    //         const xScale = d3
    //             .scaleLinear()
    //             .domain([xMin - (data_choice == 1 ? 2 : 0.01), xMax + (data_choice == 1 ? 2 : 0.01)])
    //             .range([0, width - margin.left - margin.right]);
    //         const tickFrmt = (data_choice == 1 ? (d) => (d > 100 ? '' : d) : ((d) => (d * 100) + '%'));
    //         const xAxis = d3.axisBottom(xScale).ticks(5).tickSizeOuter(0).tickFormat(tickFrmt);

    //         svg_g
    //             .selectAll("g.axis.axis--x")
    //             .data([true])
    //             .join("g")
    //             .classed("axis axis--x", true)
    //             .attr(
    //                 "transform",
    //                 `translate(0, ${height - margin.top - margin.bottom})`
    //             )
    //             .call(xAxis);

    //         d3.select(".axis.axis--x path.domain")
    //             .attr("marker-end", "url(#arrowhead-right)");
    //         d3.select(".axis.axis--x").selectAll("line").attr("stroke", "#000000");
    //         d3.select(".axis.axis--x").selectAll("path").attr("stroke", "#f00").attr("stroke-width", 3);

    //         // svg_g
    //         //     .selectAll("g.circles")
    //         //     .data([true])
    //         //     .join("g")
    //         //     .classed("circles", true);

    //         const simulation = d3
    //             .forceSimulation(data)
    //             .force("x", d3.forceX((d) => xScale(d[data_field])).strength(1))
    //             .force("y", d3.forceY((height - margin.top - margin.bottom) / 2).strength(0.1))
    //             // .force("charge", d3.forceManyBody().strength(1))
    //             .force("collide", d3.forceCollide(radius))
    //             .stop();

    //         for (let i = 0; i < 300; ++i) {
    //             simulation.tick();
    //         }

    //         // create an empty selection from data binding
    //         const circlesCon = svg_g
    //             .selectAll("g.circles")
    //             .data([true])
    //             .join("g")
    //             .classed("circles", true);

    //         const circles = circlesCon
    //             .selectAll("g.node")
    //             .data(simulation.nodes(), (d) => d.id)
    //             .join(
    //                 enter => enter
    //                     .append("g")
    //                     .attr("class", "node")
    //                     .attr("transform", (d) => `translate(0,0)`)
    //                     .transition().duration(3000)
    //                     .attr("transform", (d) => `translate(${d.x}, ${d.y})`),
    //                 update => update
    //                     // .attr("transform", (d) => `translate(0,0)`)
    //                     .transition().duration(3000)
    //                     .attr("transform", (d) => `translate(${d.x}, ${d.y})`),
    //                 exit => exit
    //                     .transition().duration(3000)
    //                     .style("opacity", 0)
    //                     .remove()
    //             );


    //         const tooltip = d3
    //             .select("body")
    //             .append("div")
    //             .attr("class", "beeswarm-tooltip")
    //             .style("opacity", 0);

    //         let showTooltipFunc = function (event, d) {
    //             tooltip.html(
    //                 `${d.title} <br> By ${d.author_name
    //                 } <br> ${data_choice == 1 ? d[data_field].toFixed(3) : d3.format(".1%")(d[data_field])}`
    //             );
    //             tooltip
    //                 .transition()
    //                 .duration(200)
    //                 .ease(d3.easePoly.exponent(1))
    //                 .style("opacity", 1)
    //                 .style(
    //                     "left",
    //                     (deviceType == "desktop" ? event.pageX : 80) + "px"
    //                 )
    //                 .style("top", event.pageY - 28 + "px");
    //         };

    //         let hideTooltipFunc = function (event, d) {
    //             tooltip.transition().duration(100).style("opacity", 0);
    //         };

    //         // Iterate through each node
    //         circles.each(function (d) {
    //             const currentNode = d3.select(this);
    //             const headshot = d.image_url;

    //             // //create circle
    //             // currentNode
    //             //     .selectAll("circle")
    //             //     .data([true])
    //             //     .join("circle")
    //             //     .attr("r", radius)
    //             //     .attr("fill", circleFill)
    //             //     .attr("stroke-width", strokeWidth)
    //             //     .attr("stroke", "#00000000");

    //             currentNode
    //                 .selectAll("a")
    //                 .data([true])
    //                 .join("a")
    //                 .attr(
    //                     "href",
    //                     () => "https://www.goodreads.com/book/show/" + d.id
    //                 )
    //                 .attr("target", "_blank")
    //                 .selectAll("image")
    //                 .data([true])
    //                 .join("image")
    //                 .attr("class", "headshot")
    //                 .attr("width", imgWidth)
    //                 .attr("height", imgHeight)
    //                 .attr("href", headshot)
    //                 .attr("x", -imgWidth / 2) // Adjust the image position to center it
    //                 .attr("y", -imgHeight / 2)
    //                 .attr("preserveAspectRatio", "xMidYMid slice"); // Maintain aspect ratio and fill the circle

    //             currentNode
    //                 .selectAll("rect")
    //                 .data([true])
    //                 .join("rect")
    //                 .attr("class", "img-border")
    //                 .attr("width", imgWidth)
    //                 .attr("height", imgHeight)
    //                 .attr("x", -imgWidth / 2) // Adjust the image position to center it
    //                 .attr("y", -imgHeight / 2)
    //                 .attr("preserveAspectRatio", "xMidYMid slice")
    //                 .attr("fill", "none")
    //                 .attr("stroke", strokeColor)
    //                 .attr("stroke-width", strokeWidth);

    //             currentNode
    //                 .style("cursor", "pointer") // Set the cursor to pointer for the entire group
    //                 .on("mouseover", (event, d) => {
    //                     // Increase the radius of the circle to 1.5 times on mouseover
    //                     // d3.select(this)
    //                     //     .select("circle")
    //                     //     .transition()
    //                     //     .duration(200)
    //                     //     .attr("r", highlightRadius)
    //                     //     .attr(
    //                     //         "stroke-width",
    //                     //         highlightRadius * strokeMultiple
    //                     //     )
    //                     //     .attr("fill", highlightFill);

    //                     circles
    //                         .filter((x) => x.id !== d.id)
    //                         .select("image")
    //                         .attr("filter", "grayscale(0.9)");

    //                     d3.select(this)
    //                         .select("image")
    //                         .transition()
    //                         .duration(200)
    //                         .attr("height", imgHeight * imgMultiple)
    //                         .attr("width", imgWidth * imgMultiple)
    //                         .attr("x", (-imgWidth * imgMultiple) / 2) // Adjust the image position to center it
    //                         .attr("y", (-imgHeight * imgMultiple) / 2); // Maintain aspect ratio and fill the circle

    //                     d3.select(this)
    //                         .select("rect")
    //                         .transition()
    //                         .duration(200)
    //                         .attr("stroke-width", highlightStrokeWidth)
    //                         .attr("stroke", highlightFill)
    //                         .attr("height", imgHeight * imgMultiple)
    //                         .attr("width", imgWidth * imgMultiple)
    //                         .attr("x", (-imgWidth * imgMultiple) / 2)
    //                         .attr("y", (-imgHeight * imgMultiple) / 2);
    //                     //raise circle and text element on hover
    //                     // d3.select(event.currentTarget).raise();

    //                     //make tooltip visible, use custom function to return info about player
    //                     showTooltipFunc(event, d);
    //                 })
    //                 .on("mouseout", function () {
    //                     // Return to the regular size on mouseout
    //                     //   mutable hoveredPlayer = null;

    //                     // d3.select(this)
    //                     //     .select("circle")
    //                     //     .transition()
    //                     //     .duration(200)
    //                     //     .attr("r", radius)
    //                     //     .attr("stroke-width", radius * strokeMultiple)
    //                     //     .attr("fill", circleFill);

    //                     circles
    //                         .filter((x) => x.id !== d.id)
    //                         .select("image")
    //                         .attr("filter", "grayscale(0)");

    //                     d3.select(this)
    //                         .select("image")
    //                         .transition()
    //                         .duration(200)
    //                         .attr("height", imgHeight)
    //                         .attr("width", imgWidth)
    //                         .attr("x", -imgWidth / 2) // Adjust the image position to center it
    //                         .attr("y", -imgHeight / 2); // Maintain aspect ratio and fill the circle

    //                     d3.select(this)
    //                         .select("rect")
    //                         .transition()
    //                         .duration(200)
    //                         .attr("stroke-width", strokeWidth)
    //                         .attr("stroke", strokeColor)
    //                         .attr("height", imgHeight)
    //                         .attr("width", imgWidth)
    //                         .attr("x", -imgWidth / 2)
    //                         .attr("y", -imgHeight / 2);

    //                     //hide tooltip after hovering
    //                     hideTooltipFunc(event, d);
    //                 })
    //                 .on("mousemove", (event) => {
    //                     tooltip
    //                         .style("top", event.pageY - 50 + "px")
    //                         .style("left", event.pageX + 10 + "px");
    //                 });
    //         });
    //     })
    //         .catch(function (error) {
    //             console.error("Error loading the CSV file:", error);
    //         });
    // }


    // chartFuncs["top-rated-books-chart"] = topRatedBooksFunc;
    // observer.observe(document.getElementById("top-rated-books-chart"));




    //     Promise.all([
    //         d3.json("/assets/book-analysis-1/data/top_authors.json"),
    //         d3.json("/assets/book-analysis-1/data/top_author_works.json")
    //     ]).then(function([top_authors, top_author_works]){
    //         top_authors = top_authors.filter((d) => d.type == bookTypeFilter);
    //         top_author_works = top_author_works.filter((d) => d.type == bookTypeFilter);
    //         createBarChart_2(top_authors, top_author_works, "top-authors-chart", "count", "author_name", "books");
    //     })
    //     .catch(function (error) {
    //         console.error("Error loading the CSV file:", error);
    //     });



    //     Promise.all([
    //         d3.json("/assets/book-analysis-1/data/most_rated_authors.json"),
    //         d3.json("/assets/book-analysis-1/data/most_rated_author_works.json")
    //     ]).then(function([most_rated_authors, most_rated_author_works]){
    //         most_rated_authors = most_rated_authors.filter((d) => d.type == bookTypeFilter);
    //         most_rated_author_works = most_rated_author_works.filter((d) => d.type == bookTypeFilter);
    //         createBarChart_2(most_rated_authors, most_rated_author_works, "most-rated-authors-chart", "ratings_count", "author_name", "ratings");
    //     })
    //     .catch(function (error) {
    //         console.error("Error loading the CSV file:", error);
    //     });


    //     Promise.all([
    //         d3.json("/assets/book-analysis-1/data/top_rated_authors.json"),
    //         d3.json("/assets/book-analysis-1/data/top_rated_author_works.json")
    //     ]).then(function([top_authors, top_author_works]){
    //         top_authors = top_authors.filter((d) => d.type == bookTypeFilter);
    //         top_author_works = top_author_works.filter((d) => d.type == bookTypeFilter);
    //         // createBarChart_2(top_authors, top_author_works, "top-rated-authors-chart", "average_rating", "author_name");

    //         data1 = top_authors;
    //         data2 = top_author_works;
    //         metric = "average_rating";
    //         categoryField = "author_name";
    //         chartId = "top-rated-authors-chart";


    //         // remove "type" field from data
    //         data1 = data1.map((d) => {
    //             delete d.type;
    //             return d;
    //         });

    //         tbl = table(data1, {
    //             sortable: false,
    //             paged: false,
    //             style: "normal",
    //             columns: {
    //                 author_name: {
    //                     type: "string",
    //                     formatter: (d, rowIndex, row) => `<span class="pt-author">${d}</span>`,
    //                 },
    //                 average_rating: {
    //                     type: "number",
    //                     formatter: (d, rowIndex, row) => `<span class="rstar material-symbols-outlined">star</span>${d3.format(".2f")(d)}`,
    //                 },
    //             },
    //         });

    //         const tooltip = d3
    //             .select("body")
    //             .append("div")
    //             .attr("class", "author-top-works-tooltip-2")
    //             .style("opacity", 0);

    //         let showTooltipFunc = function (event) {
    //             let author_d = data2.filter((d2) => d2[categoryField] == event.target.innerText);
    //             let author_name = author_d[0][categoryField];
    //             let avg_rating = author_d[0][metric];
    //             let top_works = data2.filter((d2) => d2[categoryField] == author_name);
    //             tooltip.html(
    //                 `
    //                 <strong>${author_name}</strong> <br>
    //                 Average book rating: ${d3.format(",")(avg_rating)} <br>
    //                 <hr>
    //                 <strong>Most popular works</strong> <br>
    //                 ${top_works.map(d => `<div class='a-top-work'><div><img src=${d.image_url} /></div> 
    //                     <div><p>${d.title}</p><p>${d3.format(",")(d.ratings_count)} ratings</p><p>Rating: ${d3.format(".2f")(d.average_rating)}</p></div></div>`).join("<br>")}
    //                 `
    //             );
    //             tooltip
    //                 .transition()
    //                 .duration(200)
    //                 .ease(d3.easePoly.exponent(1))
    //                 .style("opacity", 1)
    //                 .style(
    //                     "left",
    //                     (deviceType == "desktop" ? event.pageX : 80) + "px"
    //                 )
    //                 .style("top", event.pageY - 28 + "px");
    //         };

    //         let hideTooltipFunc = function () {
    //             tooltip.transition().duration(100).style("opacity", 0);
    //         };
            
    //         d3.select("#" + chartId).node().replaceChildren();
    //         d3.select("#" + chartId).node().appendChild(tbl);

    //         d3.selectAll(".pt-author").on("mouseover", showTooltipFunc);
    //         d3.selectAll(".pt-author").on("mouseout", hideTooltipFunc);
    //     })
    //     .catch(function (error) {
    //         console.error("Error loading the CSV file:", error);
    //     });







    //     Promise.all([
    //         d3.json("/assets/book-analysis-1/data/top_publishers.json"),
    //         d3.json("/assets/book-analysis-1/data/top_publisher_works.json")
    //     ]).then(function([top_publishers, top_publisher_works]){
    //         top_publishers = top_publishers.filter((d) => d.type == bookTypeFilter);
    //         top_publisher_works = top_publisher_works.filter((d) => d.type == bookTypeFilter);
    //         createBarChart_2(top_publishers, top_publisher_works, "top-publishers-chart", "count", "publisher", "books");
    //     })
    //     .catch(function (error) {
    //         console.error("Error loading the CSV file:", error);
    //     });



    //     Promise.all([
    //         d3.json("/assets/book-analysis-1/data/most_rated_publishers.json"),
    //         d3.json("/assets/book-analysis-1/data/most_rated_publisher_works.json")
    //     ]).then(function([most_rated_publishers, most_rated_publisher_works]){
    //         most_rated_publishers = most_rated_publishers.filter((d) => d.type == bookTypeFilter);
    //         most_rated_publisher_works = most_rated_publisher_works.filter((d) => d.type == bookTypeFilter);
    //         createBarChart_2(most_rated_publishers, most_rated_publisher_works, "most-rated-publishers-chart", "ratings_count", "publisher", "ratings");
    //     })
    //     .catch(function (error) {
    //         console.error("Error loading the CSV file:", error);
    //     });



    //     Promise.all([
    //         d3.json("/assets/book-analysis-1/data/top_rated_publishers.json"),
    //         d3.json("/assets/book-analysis-1/data/top_rated_publisher_works.json")
    //     ]).then(function([top_publishers, top_publisher_works]){
    //         top_publishers = top_publishers.filter((d) => d.type == bookTypeFilter);
    //         top_publisher_works = top_publisher_works.filter((d) => d.type == bookTypeFilter);
    //         // createBarChart_2(top_publishers, top_publisher_works, "top-rated-publishers-chart", "average_rating", "publisher_name");

    //         const data1 = top_publishers.map((d) => {
    //             delete d.type;
    //             return d;
    //         });
    //         const data2 = top_publisher_works;
    //         const metric = "average_rating";
    //         const categoryField = "publisher";
    //         const chartId = "top-rated-publishers-chart";


    //         tbl = table(data1, {
    //             sortable: false,
    //             paged: false,
    //             style: "normal",
    //             columns: {
    //                 publisher: {
    //                     type: "string",
    //                     formatter: (d, rowIndex, row) => `<span class="pt-publisher">${d}</span>`,
    //                 },
    //                 average_rating: {
    //                     type: "number",
    //                     formatter: (d, rowIndex, row) => `<span class="rstar material-symbols-outlined">star</span>${d3.format(".2f")(d)}`,
    //                 },
    //             },
    //         });

    //         const tooltip = d3
    //             .select("body")
    //             .append("div")
    //             .attr("class", "publisher-top-works-tooltip-2")
    //             .style("opacity", 0);

    //         let showTooltipFunc = function (event) {

    //             let publisher_d = data2.filter((d2) => d2[categoryField] == event.target.innerText);
    //             let publisher_name = publisher_d[0][categoryField];
    //             let avg_rating = publisher_d[0][metric];
    //             let top_works = data2.filter((d2) => d2[categoryField] == publisher_name);
    //             tooltip.html(
    //                 `
    //                 <strong>${publisher_name}</strong> <br>
    //                 Average book rating: ${d3.format(",")(avg_rating)} <br>
    //                 <hr>
    //                 <strong>Most popular works</strong> <br>
    //                 ${top_works.map(d => `<div class='a-top-work'><div><img src=${d.image_url} /></div> 
    //                     <div><p>${d.title}</p><p>${d3.format(",")(d.ratings_count)} ratings</p><p>Rating: ${d3.format(".2f")(d.average_rating)}</p></div></div>`).join("<br>")}
    //                 `
    //             );
    //             tooltip
    //                 .transition()
    //                 .duration(200)
    //                 .ease(d3.easePoly.exponent(1))
    //                 .style("opacity", 1)
    //                 .style(
    //                     "left",
    //                     (deviceType == "desktop" ? event.pageX : 80) + "px"
    //                 )
    //                 .style("top", event.pageY - 28 + "px");
    //         };

    //         let hideTooltipFunc = function () {
    //             tooltip.transition().duration(100).style("opacity", 0);
    //         };
            
    //         d3.select("#" + chartId).node().replaceChildren();
    //         d3.select("#" + chartId).node().appendChild(tbl);

    //         d3.selectAll(".pt-publisher").on("mouseover", showTooltipFunc);
    //         d3.selectAll(".pt-publisher").on("mouseout", hideTooltipFunc);
    //     })
    //     .catch(function (error) {
    //         console.error("Error loading the CSV file:", error);
    //     });








        Promise.all([
            d3.json("/assets/book-analysis-1/data/series_book_perc.json"),
            d3.json("/assets/book-analysis-1/data/top_series.json"),
            d3.json("/assets/book-analysis-1/data/top_series_works.json")
        ]).then(function([series_book_perc, top_series, top_series_works]){
            series_book_perc = series_book_perc[bookTypeFilter];
            top_series = top_series.filter((d) => d.type == bookTypeFilter);
            top_series_works = top_series_works.filter((d) => d.type == bookTypeFilter);

            d3.select("#books_count_2").html(d3.format(",")(series_book_perc[0]));
            d3.select("#perc_books_in_series").html(d3.format(".2%")(series_book_perc[1]));


            const chart = d3.select("#longest-series-chart")
                .selectAll("div.longest-series-chart")
                .data([true])
                .join("div")
                .attr("class", "longest-series-chart");
            
            const series = chart
                .selectAll("div.series")
                .data(top_series)
                .join("div")
                .attr("class", "series");

            const series_names = series
                .selectAll("div.series-name")
                .data(d => [d])
                .join("div")
                .attr("class", "series-name")
                .selectAll("span")
                .data(d => [d])
                .join("span")
                .html(d => d.series_name);

            const seriesBooks = series
                .selectAll("div.series-books")
                .data(d => [d])
                .join("div")
                .attr("class", "series-books")
                .selectAll("div.series-book")
                .data(d => d3.range(1, d.count+1))
                .join("div")
                .attr("class", "series-book");


            const tooltip = d3
                .select("body")
                .append("div")
                .attr("class", "series-top-works-tooltip")
                .style("opacity", 0);

            let showTooltipFunc = function (event, d) {
                let top_works = top_series_works.filter((d2) => d2['series_id'] == d['series_id']);
                tooltip.html(
                    `
                    <strong>${d['series_id']}</strong> <br>
                    ${d3.format(",")(d['count'])} books <br>
                    <hr>
                    <strong>Most popular works in this series</strong> <br>
                    ${top_works.map(d => `<div class='a-top-work'><div><img src=${d.image_url} /></div> 
                        <div><p>${d.title}</p><p>${d3.format(",")(d.ratings_count)} ratings</p></div></div>`).join("<br>")}
                    `
                );
                tooltip
                    .transition()
                    .duration(200)
                    .ease(d3.easePoly.exponent(1))
                    .style("opacity", 1)
                    .style(
                        "left",
                        (deviceType == "desktop" ? event.pageX : 80) + "px"
                    )
                    .style("top", event.pageY - 28 + "px");
            };

            let hideTooltipFunc = function (event, d) {
                tooltip.transition().duration(100).style("opacity", 0);
            };
            series_names.on("mouseover", showTooltipFunc);
            series_names.on("mouseout", hideTooltipFunc);
            
        })
        .catch(function (error) {
            console.error("Error loading the CSV file:", error);
        });










        Promise.all([
            d3.json("/assets/book-analysis-1/data/most_rated_series.json"),
            d3.json("/assets/book-analysis-1/data/most_rated_series_works.json")
        ]).then(function([top_series, top_series_works]){
            top_series = top_series.filter((d) => d.type == bookTypeFilter);
            top_series_works = top_series_works.filter((d) => d.type == bookTypeFilter);

            createBarChart_2(top_series, top_series_works, "most-rated-series-chart", "ratings_count", "series_name", "ratings", "Most popular works in the series");            
        })
        .catch(function (error) {
            console.error("Error loading the CSV file:", error);
        });







    d3.json("/assets/book-analysis-1/data/num_pages_hists.json")
        .then(function (data) {
            data = data[bookTypeFilter];
            const inset = 1;
            const marginTop = 20; // top margin, in pixels
            const marginRight = 20; // right margin, in pixels
            const marginBottom = 40; // bottom margin, in pixels
            const marginLeft = 40; // left margin, in pixels
            const width = 800; // outer width of chart, in pixels
            const height = 500; // outer height of chart, in pixels

            const xScale = d3.scaleLinear(
                [0, d3.max(data.map((d) => d.x1))],
                [marginLeft, width - marginRight]
            );
            const yScale = d3
                .scaleSymlog(
                    [0, d3.max(data.map((d) => d.freq))],
                    [height - marginBottom, marginTop]
                )
                .constant(1)
                .clamp(true)
                .nice();

            const svg = d3
                .select("#num-pages-hist-chart")
                .selectAll("svg")
                .data([true])
                .join("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [0, 0, width, height])
                .attr(
                    "style",
                    "max-width: 100%; height: auto; height: intrinsic;"
                );

            // svg.append("linearGradient")
            //     .attr("id", "area-gradient")
            //     .attr("gradientUnits", "userSpaceOnUse")
            //     .attr("x1", "100%")
            //     .attr("y1", "0%")
            //     .attr("x2", "0%")
            //     .attr("y2", "0%")
            //     .selectAll("stop")
            //     .data([
            //         { offset: "0%", color: "navy" },
            //         // add additional steps as needed for gradient.
            //         { offset: "95%", color: "transparent" },
            //     ])
            //     .enter()
            //     .append("stop")
            //     .attr("offset", function (d) {
            //         return d.offset;
            //     })
            //     .attr("stop-color", function (d) {
            //         return d.color;
            //     });
            
            const g = svg
                    .selectAll("g.histogram")
                    .data([true])
                    .join("g")
                    .attr("class", "histogram");

            let rects = g
                // .attr("fill", "url(#area-gradient)")
                .attr("fill", "steelblue")
                .selectAll("rect")
                .data(data)
                .join("rect")
                // .attr("fill", "linear-gradient(180deg, #fff, #ddd)")
                .attr("x", (d) => xScale(d.x0) + inset)
                .attr("width", (d) =>
                    Math.max(0, xScale(d.x1) - xScale(d.x0) - inset)
                )
                .attr("y", (d, i) => yScale(d.freq))
                .attr("height", (d, i) => yScale(0) - yScale(d.freq));

            let histTooltip = d3
                .select("body")
                .append("div")
                .attr("class", "num-pages-hist-tooltip")
                .style("opacity", 0);

            let showTooltipFunc = function (event, d) {
                histTooltip.html(
                    `<strong>${humanFormatNumber(
                        d.x0,
                        2
                    )} - ${humanFormatNumber(d.x1, 2)}</strong> pages <br> 
                    ${d3.format(",")(d.freq)} books`
                );
                histTooltip
                    .transition()
                    .duration(200)
                    .ease(d3.easePoly.exponent(1))
                    .style("opacity", 1)
                    .style(
                        "left",
                        (deviceType == "desktop" ? event.pageX : 80) + "px"
                    )
                    .style("top", event.pageY - 28 + "px");
            };

            let hideTooltipFunc = function (event, d) {
                histTooltip.transition().duration(100).style("opacity", 0);
            };

            rects
                .on("mouseover", showTooltipFunc)
                .on("touchstart", showTooltipFunc)
                .on("mouseout", hideTooltipFunc)
                .on("touchend", hideTooltipFunc);

            let xAxg = g
                .selectAll("g.x-axis")
                .data([true])
                .join("g")
                .attr("class", "x-axis");

            xAxg
                .attr("transform", `translate(0,${height - marginBottom})`)
                .call((g) =>
                    g
                        .append("text")
                        .attr("x", width)
                        .attr("y", marginBottom - 4)
                        .attr("fill", "currentColor")
                        .attr("text-anchor", "end")
                        .text("Rating count →")
                )
                .transition()
                .duration(750)
                .call(
                    d3
                        .axisBottom(xScale)
                        .ticks(10)
                        .tickFormat((d) => humanFormatNumber(d))
                        .tickSizeOuter(0)
                );
                

            let yAxg = g
                .selectAll("g.y-axis")
                .data([true])
                .join("g")
                .attr("class", "y-axis");

            const yTickValues = generateLogScaleArray(yScale.domain()[1]);

            // Add the y-axis and label, and remove the domain line.
            yAxg
                .attr("transform", `translate(${marginLeft},0)`)
                .call((g) => g.select(".domain").remove())
                .call((g) =>
                    g
                        .append("text")
                        .attr("x", -marginLeft)
                        .attr("y", 10)
                        .attr("fill", "currentColor")
                        .attr("text-anchor", "start")
                        .text("↑ Frequency (no. of books)")
                )
                .transition()
                .duration(750)
                .call(
                    d3
                        .axisLeft(yScale)
                        // .ticks(-10)
                        .tickValues(yTickValues)
                        // .tickValues()
                        .tickFormat((d) =>
                        // console.log("yTickValues", yTickValues, "Math.max(yTickValues)", Math.max(yTickValues), d, Math.log10(d) % 1 === 0, d == Math.max(yTickValues), (Math.log10(d) % 1 === 0) || (d == Math.max(yTickValues)))
                            (Math.log10(d) % 1 === 0) || (d == Math.max(...yTickValues)) ? humanFormatNumber(d) : ""
                        )
                        .tickSizeOuter(0)
                );
        })
        .catch(function (error) {
            console.error("Error loading the CSV file:", error);
        });


















        d3.json("/assets/book-analysis-1/data/long_books_high_ratings.json")
        .then(function (data) {
            data = data.filter((d) => d.type == bookTypeFilter);

            const data1 = data.map((d) => {
                delete d.type;
                delete d.id;
                delete d.author_name;
                return d;
            });
            const chartId = "long-high-rating-chart";


            tbl = table(data1, {
                sortable: false,
                paged: false,
                style: "normal",
                columns: {
                    image_url: {
                        type: "string",
                        formatter: (d, rowIndex, row) => `<img class="pt-cover" src="${d}">`
                    },
                    title: {
                        type: "string"
                    },
                    num_pages: {
                        type: "number",
                        formatter: (d, rowIndex, row) => d3.format(",")(d)
                    },
                    average_rating: {
                        type: "number",
                        formatter: (d, rowIndex, row) => `<span class="rstar material-symbols-outlined">star</span>${d3.format(".2f")(d)}`
                    },
                    ratings_count: {
                        type: "number",
                        formatter: (d, rowIndex, row) => d3.format(",")(d)
                    }
                }
            });

            d3.select("#" + chartId).node().replaceChildren();
            d3.select("#" + chartId).node().appendChild(tbl);

        })
        .catch(function (error) {
            console.error("Error loading the CSV file:", error);
        });



        d3.json("/assets/book-analysis-1/data/shelf_ts.json")
        .then(function (data) {
            const parseDate = d3.timeParse("%Y-%m-%d");
            data = data.map((d) => {
                d.pub_date = parseDate(d.pub_date);
                return d;
            });

            data = data.map(obj => {
                obj['Genre'] = obj.shelf;
                delete obj.shelf;
                obj['Number of Books'] = obj.count;
                delete obj.count;
                obj['Publication Year'] = obj.pub_date;
                delete obj.pub_date;
                return obj;
            });

            const plotShelfTS = (data) => {
                document.getElementById("pl").innerHTML = "";

                const p = Plot.plot({
                    style: "overflow: visible;",
                    y: {grid: true},
                    color: {
                        type: "categorical",
                        // scheme: "category10",
                    },
                    marks: [
                        Plot.ruleY([0]),
                        Plot.lineY(data, {
                            x: "Publication Year", y: "Number of Books", stroke: "Genre", ariaLabel: "Genre",
                            strokeWidth: 2,
                            tip: { format: { stroke: true, x: (d) => d.getFullYear(), y: (d) => d3.format(",")(d) } , lineHeight: 1.5}
                        }),
                        Plot.text(data, Plot.selectLast({ x: "Publication Year", y: "Number of Books", z: "Genre", text: "Genre", textAnchor: "start", dx: 3 })),
                        // Plot.tip(data, Plot.pointerX({x: "Publication Year", y: "Number of Books"}))
                    ]
                });

                document.getElementById("pl").appendChild(p);
            };

            plotShelfTS(data);

            // create a group of radio button filters to choose shelves
            const shelfFilters = d3
                .select("#shelf-filters")
                .selectAll("div.shelf-radio")
                .data([...new Set(data.map(obj => obj['Genre']))])
                .join("div")
                .attr("class", "shelf-filter");

            shelfFilters
                .selectAll("input")
                .data(d => [d])
                .join("input")
                .attr("type", "checkbox")
                .attr("name", "shelf")
                .attr("value", (d) => d)
                .attr("id", (d) => "shelf-" + d)
                .property("checked", true)
                .on("change", (event) => {
                    let checkedShelves = Array.from(document.querySelectorAll('input[name=shelf]:checked')).map(cb => cb.value);
                    let filteredData = data.filter((d) => checkedShelves.includes(d['Genre']));
                    plotShelfTS(filteredData);
                }
            );

            shelfFilters
                .selectAll("label")
                .data(d => [d])
                .join("label")
                .attr("for", (d) => "shelf-" + d)
                .text((d) => d);

            // d3.select("#pl").selectAll("path").each(function(d, i) {
            //     // coordinates
            //     // console.log(this);
            //     d3.select(this).on("mouseover", function(event, d) {
            //         console.log("d", d);
            //         console.log("event", event);
            //     });
            //     d3.select(this).attr("aria-label", "shelf " + d.shelf);
            // });

        })
        .catch(function (error) {
            console.error("Error loading the CSV file:", error);
        });

        // xx make sure no extra tooltips are added every time the data is updated 
        var tooltip_div = d3.select("body").append("div")
            .attr("class", "wc-tooltip")
            .style("opacity", 0);

        function WordCloud(word_freq, {
            size = group => group.length, // Given a grouping of words, returns the size factor for that word
            word = d => d, // Given an item of the data array, returns the word
            marginTop = 0, // top margin, in pixels
            marginRight = 0, // right margin, in pixels
            marginBottom = 0, // bottom margin, in pixels
            marginLeft = 0, // left margin, in pixels
            width = 640, // outer width, in pixels
            height = 400, // outer height, in pixels
            maxWords = 250, // maximum number of words to extract from the text
            fontFamily = "sans-serif", // font family
            fontScale = 15, // base font size
            fill = null, // text color, can be a constant or a function of the word
            padding = 0, // amount of padding between the words (in pixels)
            rotate = 0, // a constant or function to rotate the words
            // invalidation // when this promise resolves, stop the simulation
            } = {}) {

            // document.getElementById(chartId).innerHTML = "";
            
            const data = word_freq.slice(0, maxWords);
            
            const svg = d3.create("svg")
                .attr("viewBox", [0, 0, width, height])
                .attr("width", width)
                .attr("font-family", fontFamily)
                .attr("text-anchor", "middle")
                .attr("style", "max-width: 100%; height: auto; height: intrinsic;");
            
            const g = svg.append("g").attr("transform", `translate(${marginLeft},${marginTop})`);

            if (d3wc_cloud !== undefined) {
                d3wc_cloud.stop();
                d3wc_cloud = undefined;
            }

            const maxSize = Math.sqrt(d3.max(data, d => d.size)) * fontScale;
            const minSize = Math.sqrt(d3.min(data, d => d.size)) * fontScale;

            function handleMouseOver(event, d) {
                sentences = data.filter((dt) => dt.text == d3.select(this).text())[0].sentences;
                // for each sentence, highlight the word that matches d with <mark>
                sentences = sentences.map((s) => s.replace(new RegExp(d, "gi"), match => `<mark>${match}</mark>`));
                d3.select(this).classed("word-hovered", true);
                
                tooltip_div.transition()
                    .duration(200)
                    .style("opacity", 1)
                    .style("left", (deviceType == "desktop" ? event.pageX : 80) + "px")
                    .style("top", event.pageY - 28 + "px");
                
                // show sentences separated by <br>
                tooltip_div.html(sentences.join("<br><br>"));
            }

            function handleMouseOut(event, d) {
                d3.select(this)
                  .classed("word-hovered", false);
                
                  tooltip_div.transition()
                   .duration(500)
                   .style("opacity", 0);
            }

            const colorMap = () => {
                const colors = ['#67001f', '#67001f', '#878787', '#1a1a1a', '#d6604d'];
                return colors[Math.floor(Math.random() * colors.length)];
            };
            
            d3wc_cloud = d3.layout.cloud()
                .size([width - marginLeft - marginRight, height - marginTop - marginBottom])
                .words(data)
                .padding(padding)
                .rotate(rotate)
                .font(fontFamily)
                .fontSize(d => Math.sqrt(d.size) * fontScale)
                .on("word", (word) => {
                    g.append("text")
                        .datum(word.text)
                        .attr("font-size", word.size)
                        .attr("fill", d3.scaleLinear([minSize, maxSize], ['orange', 'black'])(word.size))
                        .attr("fill", `${colorMap()}`)
                        .attr("transform", `translate(${word.x},${word.y}) rotate(${word.rotate})`)
                        .style('cursor', 'pointer')
                        .text(word.text)
                        .on("mouseover", handleMouseOver)
                        .on("mouseout", handleMouseOut);
                });
            
            d3wc_cloud.start();
            // invalidation && invalidation.then(() => cloud.stop());
            
            return svg.node();
        };




        d3.json("/assets/book-analysis-1/data/word_freqs.json")
        .then(function (data) {
            // console.log("data before filter", structuredClone(data));
            data = data.filter((d) => d.type == bookTypeFilter);
            // console.log("data after filter", structuredClone(data));
            // const wordCloud = d3.select("#word-cloud-chart").selectAll("div.word-cloud-chart").data([true]).join("div").attr("class", "word-cloud-chart");
            // wordCloud.node().replaceChildren();
            // wordCloud.node().appendChild(wordCloudChart(data, "word-cloud-chart"));


            // create button group to filter word cloud by decade
            const wordCloudDecadeFilters = d3
                .select("#common-words-options")
                .selectAll("div.word-cloud-option")
                .data([...new Set(data.map(obj => obj['period']))])
                .join("div")
                .attr("class", "word-cloud-option")
                .call(dd => {
                    dd.selectAll("input")
                        .data(d => [d])
                        .join("input")
                        .attr("type", "radio")
                        .attr("name", "word-cloud-decade")
                        .attr("value", (d) => d)
                        .attr("id", (d) => "word-cloud-decade-" + d)
                        .attr("class", "word-cloud-radio")
                        // .property("checked", (d) => d == 2020)
                        ;
                })
                .call(dd => {
                    dd.selectAll("label")
                        .data(d => [d])
                        .join("label")
                        .attr("for", (d) => "word-cloud-decade-" + d)
                        .text((d) => d);
                });

            
            // when a radio button is clicked, filter the word cloud by the selected decade
            d3.selectAll("input.word-cloud-radio").on("change", (event) => {
                let val = event.target.value;
                console.log("FILTER", val);
                let filteredData = structuredClone(data.filter((d) => d['period'] == val));

                // reduce "size"
                let max_size = d3.max(filteredData.map((d) => d.size));
                console.log("max_size", max_size);
                filteredData = filteredData.map((d) => {
                    d.size = d.size / max_size * 100;
                    // d.fill = d.size > 50 ? "black" : "red";
                    return d;
                });
                
                // console.log("FILTER", val);
                // console.log("filteredData", structuredClone(filteredData));
                // console.log("data xx", structuredClone(data));
                // console.log("word-cloud-chart", document.getElementById("word-cloud-chart").cloneNode(true));
                // document.getElementById("word-cloud-chart").innerHTML = "";
                // console.log("word-cloud-chart", document.getElementById("word-cloud-chart").cloneNode(true));
                // console.log("==============-------------------===============");
                let wc = WordCloud(filteredData, {
                    chartId: "word-cloud-chart",
                    fontFamily: "Source Serif Pro",
                    padding: 3,
                    rotate: 0, //() => ~~(Math.random() * 4) * 45 - 45,
                    width: 1000,
                    height: 600,
                    maxWords: 200,
                    fontScale: 6
                });

                // console.log("wc", wc);
                document.getElementById("word-cloud-chart").innerHTML = "";
                document.getElementById("word-cloud-chart").appendChild(wc);
                console.log(d3.selectAll("#word-cloud-chart svg text").size());
            });
            

            // initial word cloud.. select the first decade.. trigger the change event
            d3.selectAll("input.word-cloud-radio").filter((d, i) => i == 0).node().click();

            // WordCloud(data.filter((d) => d['period'] == 2020), {
            //     chartId: "word-cloud-chart",
            //     // fill: "black",
            //     fontFamily: "sans-serif",
            //     // fontScale: 15,
            //     padding: 1,
            //     rotate: 0,
            //     width: 640,
            //     height: 400,
            //     maxWords: 250
            // });
            
        })
}

let bookTypeFilter = "all";

document.addEventListener("DOMContentLoaded", processData);

// setTimeout(() => {
//     processData(); // xx
// }, 7000);

$('#book-type-filter-wrapper input[type="radio"]').on('change', (event) => {
    let val = $(event.target).val();
    bookTypeFilter = val;
    processData();
});

// when the C button on keyboard is pressed, change bookTypeFilter to non-fiction and trigger processData
document.addEventListener("keydown", (event) => {
    if (event.key == "c") {
        bookTypeFilter = "non-fiction";
        processData();
    }
});


// const openaiApiKey = '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'; 

// const data = {
//   model: "gpt-3.5-turbo",
//   messages: [
//     {
//       role: "system",
//       content: "You are a helpful assistant."
//     },
//     {
//       role: "user",
//       content: "Who won the world series in 2020?"
//     },
//     {
//       role: "assistant",
//       content: "The Los Angeles Dodgers won the World Series in 2020."
//     },
//     {
//       role: "user",
//       content: "Where was it played?"
//     }
//   ]
// };

// fetch('https://api.openai.com/v1/chat/completions', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${openaiApiKey}`
//   },
//   body: JSON.stringify(data)
// })
// .then(response => response.json())
// .then(data => console.log(data))
// .catch((error) => console.error('Error:', error));