@include('errors._layout', [
    'code'      => 419,
    'title'     => __('site.errors.419.title'),
    'body'      => __('site.errors.419.body'),
    'cta_href'  => url()->previous() ?: url('/'),
    'cta_label' => __('site.errors.back_home'),
])
