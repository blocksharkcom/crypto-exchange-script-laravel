@include('errors._layout', [
    'code'      => 404,
    'title'     => __('site.errors.404.title'),
    'body'      => __('site.errors.404.body'),
    'cta_href'  => url('/'),
    'cta_label' => __('site.errors.back_home'),
])
