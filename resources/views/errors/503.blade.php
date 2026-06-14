@include('errors._layout', [
    'code'      => 503,
    'title'     => __('site.errors.503.title'),
    'body'      => __('site.errors.503.body'),
    'cta_href'  => url('/'),
    'cta_label' => __('site.errors.back_home'),
])
