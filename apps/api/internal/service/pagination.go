package service

const (
	defaultPerPage = 20
	maxPerPage     = 100
)

// normalizePage clamps page/per_page to sane defaults — see
// docs/Schema.md §4 (default per_page = 20, max = 100).
func normalizePage(page, perPage int) (int, int) {
	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = defaultPerPage
	}
	if perPage > maxPerPage {
		perPage = maxPerPage
	}
	return page, perPage
}
