@include('errors._layout', [
    'code'      => 500,
    'title'     => __('site.errors.500.title'),
    'body'      => __('site.errors.500.body'),
    'cta_href'  => url('/'),
    'cta_label' => __('site.errors.back_home'),
])
