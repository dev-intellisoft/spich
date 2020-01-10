/**
 * Created by wuxin on 12/07/2017.
 */
exports.pagination = (page, perpage) => {
    // page = page || 1
    // perpage = perpage
    return ` limit ${perpage} offset ${(page - 1) * perpage}`
}
exports.sort = (option) => {
    if (option) {
        return `order by ${option.key} ${option.sort}`
    } else {
        return ``
    }
}